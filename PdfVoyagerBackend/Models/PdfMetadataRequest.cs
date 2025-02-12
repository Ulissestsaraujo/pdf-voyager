using Newtonsoft.Json;

namespace PdfVoyagerBackend.Models;

public class PdfMetadataRequest
{
    [JsonProperty("fileName")]
    public string FileName { get; set; }
    
    [JsonProperty("blobUrl")]
    public string BlobUrl { get; set; }
}