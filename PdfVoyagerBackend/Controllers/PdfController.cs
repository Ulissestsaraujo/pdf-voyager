using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using PdfVoyagerBackend.Models;
using PdfVoyagerBackend.Services;

namespace PdfVoyagerBackend.Controllers;

[ApiController]
[Route("api/pdf")]
public class PdfController(AzureBlobService blobService, CosmosDbService dbService, IMapper mapper) : ControllerBase
{
    [HttpPost("generate-upload-url")]
    public async Task<IActionResult> GenerateUploadUrl([FromBody] UploadRequest request)
    {
        var sasUrl = await blobService.GenerateUploadSasUrl(request.Filename);
        return Ok(new { sasUrl });
    }
    
    [HttpPost("save-metadata")]
    public async Task<IActionResult> SaveMetadata([FromBody] PdfMetadataRequest request, CosmosDbService cosmosDbService)
    {
        var pdfMetadata = mapper.Map<PdfMetadata>(request);
        if (!await blobService.DocumentExistsAsync(request.FileName))
        {
            return BadRequest("PDF not uploaded yet.");
        }

        await dbService.AddPdfMetadataAsync(pdfMetadata);

        return Ok();
    }
    
    
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPdfsByUserId(string userId)
    {
        var pdfs = await dbService.GetPdfsByUserIdAsync(userId);
        return Ok(pdfs);
    }
    
    // TODO: When we actually have authentication userIds need to go in auth and not like this.
    [HttpGet("{userId}/{pdfId}/read-url")]
    public async Task<IActionResult> GetPdfById(string userId, string pdfId)
    {
        var pdf = await dbService.GetPdfByIdAsync(userId, pdfId);
        var sasUrl = blobService.GenerateReadSasUrl(pdf.FileName);
        return Ok(sasUrl);
    }
}