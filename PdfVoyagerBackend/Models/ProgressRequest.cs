using System.ComponentModel.DataAnnotations;

namespace PdfVoyagerBackend.Models;

public class ProgressRequest
{    
    [Required]
    public string PdfId { get; set; }
    [Required]
    public int LastPage { get; set; }
}