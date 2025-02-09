using Newtonsoft.Json;

namespace PdfVoyagerBackend.Models;

public class PdfMetadata
{

    [JsonProperty("id")]  
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonProperty("userId")]
    public string UserId { get; set; } 

    [JsonProperty("fileName")]
    public string FileName { get; set; }

    [JsonProperty("uploadDate")]
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    [JsonProperty("blobUrl")]
    public string BlobUrl { get; set; }
}