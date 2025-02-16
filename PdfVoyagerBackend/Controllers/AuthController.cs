using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdfVoyagerBackend.DbContext;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Models;
using PdfVoyagerBackend.Services;

namespace PdfVoyagerBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(DbService dbService, JwtService jwtService, IWebHostEnvironment environment)
    : ControllerBase
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
        var refreshToken = jwtService.GenerateRefreshToken(user);
        SetTokensInCookies(token, refreshToken);

        return Ok(new
        {
            Message = "Login successful",
            ExpiresIn = 15 * 60
        });
    }

    [HttpGet("user-info")]
    [Authorize]
    public async Task<IActionResult> GetUserInfo()
    {
        var userId = User.FindFirst("id")?.Value;
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

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var cookieOptionsAccess = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };
        var cookieOptionsRefresh = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        if (environment.IsDevelopment())
        {
            cookieOptionsAccess.Domain = "localhost";
            cookieOptionsRefresh.Domain = "localhost";
        }
        Response.Cookies.Delete("accessToken", cookieOptionsAccess);
        Response.Cookies.Delete("refreshToken", cookieOptionsRefresh);
        return Ok(new { Message = "Logged out successfully" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken)) return Unauthorized();

        try
        {
            var userId = jwtService.GetUserIdFromRefreshToken(refreshToken);
            var user = await dbService.GetUserByIdAsync(userId);

            var newAccessToken = jwtService.GenerateJwtToken(user);
            var newRefreshToken = jwtService.GenerateRefreshToken(user);

            SetTokensInCookies(newAccessToken, newRefreshToken);

            return Ok(new { ExpiresIn = 900 }); // 15 minutes
        }
        catch
        {
            return Unauthorized();
        }
    }

    private void SetTokensInCookies(string accessToken, string refreshToken)
    {
        var cookieOptionsAccess = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };
        var cookieOptionsRefresh = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        if (environment.IsDevelopment())
        {
            cookieOptionsAccess.Domain = "localhost";
            cookieOptionsRefresh.Domain = "localhost";
        }

        Response.Cookies.Append("accessToken", accessToken, cookieOptionsAccess);

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptionsRefresh);
    }
}