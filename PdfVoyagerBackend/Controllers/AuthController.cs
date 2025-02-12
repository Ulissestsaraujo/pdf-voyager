using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using PdfVoyagerBackend.DbContext;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Models;
using PdfVoyagerBackend.Services;

namespace PdfVoyagerBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(DbService dbService, JwtService jwtService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var success = await dbService.RegisterUserAsync(request.Email, request.Password);
        if (!success)
        {
            return BadRequest("User already exists.");
        }

        return Ok(new { Message = "User registered successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await dbService.AuthenticateUserAsync(request.Email, request.Password);
        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = jwtService.GenerateJwtToken(user);
        return Ok(new { Token = token });
    }

    [HttpGet("user-info")]
    [Authorize]
    public async Task<IActionResult> GetUserInfo()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await dbService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new { user.Email });
    }
}