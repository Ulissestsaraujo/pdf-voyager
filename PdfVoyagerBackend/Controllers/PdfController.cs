using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdfVoyagerBackend.Models;
using PdfVoyagerBackend.Services;

namespace PdfVoyagerBackend.Controllers;

[ApiController]
[Route("api/pdf")]
[Authorize]
public class PdfController(AzureBlobService blobService, DbService dbService, IMapper mapper) : ControllerBase
{
    [HttpPost("generate-upload-url")]
    public async Task<IActionResult> GenerateUploadUrl([FromBody] UploadRequest request)
    {
        var sasUrl = await blobService.GenerateUploadSasUrl(request.Filename);
        return Ok(new { sasUrl });
    }
    
    [HttpPost("save-metadata")]
    public async Task<IActionResult> SaveMetadata([FromBody] PdfMetadataRequest request)
    {
        var userId = GetUserIdFromToken();
        var pdfMetadata = mapper.Map<PdfMetadata>(request);
        pdfMetadata.UserId = userId;
        if (!await blobService.DocumentExistsAsync(request.FileName))
        {
            return BadRequest("PDF not uploaded yet.");
        }

        await dbService.AddPdfMetadataAsync(pdfMetadata);

        return Ok();
    }
    
    
    [HttpGet]
    public async Task<IActionResult> GetPdfsByUserId()
    {
        var userId = GetUserIdFromToken();
        var pdfs = await dbService.GetPdfsByUserIdAsync(userId);
        return Ok(pdfs);
    }
    
    [HttpGet("{pdfId}/read-url")]
    public async Task<IActionResult> GetPdfById(string pdfId)
    {
        var userId = GetUserIdFromToken();
        var pdf = await dbService.GetPdfByIdAsync(userId, pdfId);
        var sasUrl = blobService.GenerateReadSasUrl(pdf.FileName);
        return Ok(sasUrl);
    }
    
    private string GetUserIdFromToken()
    {
        var userId = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        return userId;
    }
}