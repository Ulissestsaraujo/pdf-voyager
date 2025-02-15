using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdfVoyagerBackend.Models;
using PdfVoyagerBackend.Services;

namespace PdfVoyagerBackend.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController(DbService dbService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SaveProgress([FromBody] ProgressRequest request)
    {
        var userId = GetUserIdFromToken();
        var readProgress = new ReadingProgress()
        {
            PdfId = request.PdfId,
            LastPage = request.LastPage,
            UserId = userId
        };
        await dbService.SaveProgressAsync(readProgress);
        return Ok();
    }
    
    [HttpGet("{pdfId}")]
    public async Task<ActionResult<int>> GetProgress(string pdfId)
    {
        var userId = GetUserIdFromToken();
        var progress = await dbService.GetProgressAsync(userId, pdfId);


        return Ok(progress);
    }
    
    
    private string GetUserIdFromToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        return userId;
    }
}