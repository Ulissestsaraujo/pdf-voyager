using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PdfVoyagerBackend.Models;

namespace PdfVoyagerBackend.Services;

public class JwtService(IConfiguration configuration)
{
    private readonly SymmetricSecurityKey _securityKey = new(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]));
  public string GenerateJwtToken(User user)
      {
          var claims = new[]
          {
              new Claim(JwtRegisteredClaimNames.Sub, user.Email),
              new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
              new Claim("id", user.Id)
          };
  
          return GenerateToken(
              claims,
              DateTime.UtcNow.AddMinutes(2), // Shorter expiration for access token
              configuration["Jwt:Issuer"]!,
              configuration["Jwt:Audience"]!
          );
      }

      public string GenerateRefreshToken(User user)
      {
          var claims = new[]
          {
              new Claim(ClaimTypes.NameIdentifier, user.Id),
              new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
              new Claim("refresh", "true")
          };

          return GenerateToken(
              claims,
              DateTime.UtcNow.AddDays(7), // Longer expiration for refresh token
              configuration["Jwt:Issuer"]!,
              configuration["Jwt:Audience"]!
          );
      }
    
    private string GenerateToken(
        IEnumerable<Claim> claims,
        DateTime expiration,
        string issuer,
        string audience)
    {
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(
                 _securityKey,
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
    
    private ClaimsPrincipal? ValidateToken(string token, bool isRefreshToken = false)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _securityKey,
                ValidateIssuer = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            
            if (isRefreshToken)
            {
                if (!principal.HasClaim(c => c.Type == "refresh" && c.Value == "true"))
                {
                    throw new SecurityTokenException("Invalid refresh token");
                }
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public string GetUserIdFromRefreshToken(string refreshToken)
    {
        var principal = ValidateToken(refreshToken, true);
        return principal?.FindFirstValue(ClaimTypes.NameIdentifier) 
               ?? throw new SecurityTokenException("Invalid refresh token");
    }
}