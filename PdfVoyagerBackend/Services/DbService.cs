using System.Net;
using Microsoft.EntityFrameworkCore;
using PdfVoyagerBackend.DbContext;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Models;
using User = PdfVoyagerBackend.Models.User;

namespace PdfVoyagerBackend.Services;

public class DbService(AppDbContext dbContext)
{
    public async Task<List<PdfMetadata>> GetPdfsByUserIdAsync(string userId)
    {
        return await dbContext.PdfMetadata
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<PdfMetadata> GetPdfByIdAsync(string userId, string pdfId)
    {
        return await dbContext.PdfMetadata
                   .FirstOrDefaultAsync(p => p.Id == pdfId && p.UserId == userId) ??
               throw new FileNotFoundException("No such Pdf Found for the given user.");
    }

    public async Task AddPdfMetadataAsync(PdfMetadata pdfMetadata)
    {
        dbContext.PdfMetadata.Add(pdfMetadata);
        await dbContext.SaveChangesAsync();
    }
    public async Task<bool> RegisterUserAsync(string email, string password)
    {
        if (await dbContext.Users.AnyAsync(u => u.Email == email))
        {
            return false; 
        }

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<User?> AuthenticateUserAsync(string email, string password)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null; 
        }

        return user;
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        return await dbContext.Users.FindAsync(userId);
    }
}