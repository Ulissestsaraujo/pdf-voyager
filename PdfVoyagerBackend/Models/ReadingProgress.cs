using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PdfVoyagerBackend.Models;

public class ReadingProgress
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; } 
    [Required]
    public string UserId { get; set; }
    [Required]
    public string PdfId { get; set; }
    [Required]
    public int LastPage { get; set; }
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}