using System.Net;
using Microsoft.Azure.Cosmos;
using PdfVoyagerBackend.Models;

namespace PdfVoyagerBackend.Services;

public class CosmosDbService(CosmosClient cosmosClient, IConfiguration configuration)
{
    private readonly string _databaseName = configuration["AzureCosmos:DatabaseName"]!;
    private readonly string _containerName = configuration["AzureCosmos:ContainerName"]!;

    public async Task<List<PdfMetadata>> GetPdfsByUserIdAsync(string userId)
    {
        var container = cosmosClient.GetContainer(_databaseName, _containerName);
        var query = new QueryDefinition("SELECT * FROM c WHERE c.userId = @userId")
            .WithParameter("@userId", userId);

        var iterator = container.GetItemQueryIterator<PdfMetadata>(query);
        var results = new List<PdfMetadata>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<PdfMetadata> GetPdfByIdAsync(string userId, string pdfId)
    {
        var container = cosmosClient.GetContainer(_databaseName, _containerName);

        ItemResponse<PdfMetadata>
            response = await container.ReadItemAsync<PdfMetadata>(pdfId, new PartitionKey(userId));
        return response.Resource;
    }

    public async Task AddPdfMetadataAsync(PdfMetadata pdfMetadata)
    {
        var container = cosmosClient.GetContainer(_databaseName, _containerName);
        await container.CreateItemAsync(pdfMetadata, new PartitionKey(pdfMetadata.UserId));
    }
}