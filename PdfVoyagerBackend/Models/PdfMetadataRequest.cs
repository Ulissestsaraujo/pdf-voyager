using Newtonsoft.Json;

namespace PdfVoyagerBackend.Models;

public class PdfMetadataRequest
{
  
    [JsonProperty("userId")]
    public string UserId { get; set; } // Assume you have user auth later
  
    [JsonProperty("fileName")]
    public string FileName { get; set; }
    
    [JsonProperty("blobUrl")]
    public string BlobUrl { get; set; }
}