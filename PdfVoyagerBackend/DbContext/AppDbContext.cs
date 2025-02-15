using Microsoft.EntityFrameworkCore;
using PdfVoyagerBackend.Models;
using User = PdfVoyagerBackend.Models.User;

namespace PdfVoyagerBackend.DbContext;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbSet<PdfMetadata> PdfMetadata { get; set; }
    public DbSet<User> Users { get; set; }
    
    public DbSet<ReadingProgress> ReadingProgresses { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<PdfMetadata>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.FileName).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.UploadDate).IsRequired();
            entity.Property(e => e.BlobUrl).IsRequired();
        });
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });
    }
    
}