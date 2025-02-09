using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace PdfVoyagerBackend.Services;

public class AzureBlobService(BlobServiceClient blobServiceClient)
{
    public async Task<string> GenerateUploadSasUrl(string filename)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient("pdfs");
        await containerClient.CreateIfNotExistsAsync();
        
        var blobClient = containerClient.GetBlobClient(filename);

        BlobSasBuilder sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = containerClient.Name,
            BlobName = blobClient.Name,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow,
            ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Write|BlobSasPermissions.Read);

        return blobClient.GenerateSasUri(sasBuilder).ToString();
    }

    public async Task<bool> DocumentExistsAsync(string filename)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient("pdfs");
        var blobClient = containerClient.GetBlobClient(filename);
        return await blobClient.ExistsAsync();
    }

    public Task<string> GenerateReadSasUrl(string filename)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient("pdfs");

        if (!containerClient.Exists())
        {
            throw new Exception("Container does not exist.");
        }

        var blobClient = containerClient.GetBlobClient(filename);
        if (!blobClient.Exists())
        {
            throw new Exception("Blob does not exist.");
        }

        
        BlobSasBuilder sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = containerClient.Name,
            BlobName = blobClient.Name,
            Resource = "b",
            StartsOn = DateTime.UtcNow,
            ExpiresOn = DateTime.UtcNow.AddHours(1) // Set expiration time
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        
        if (!blobServiceClient.CanGenerateAccountSasUri)
        {
            throw new InvalidOperationException("Cannot generate SAS URL - Missing Shared Key Credential.");
        }

        var sasToken = blobClient.GenerateSasUri(sasBuilder).ToString();
        return Task.FromResult($"{sasToken}&response-content-type=application/pdf"); // ✅ Wrap the result in Task.FromResult()
    }
}