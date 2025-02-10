using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Azure.Storage.Blobs;
using Microsoft.Azure.Cosmos;
using PdfVoyagerBackend;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Profiles;
using PdfVoyagerBackend.Services;

var builder = WebApplication.CreateBuilder(args);
var keyVaultUri = new Uri("https://pdf-voyager-kv.vault.azure.net/");
var secretClient = new SecretClient(keyVaultUri, new DefaultAzureCredential());

KeyVaultSecret blobConnectionString = await secretClient.GetSecretAsync("BlobStorageConnectionString");
KeyVaultSecret cosmosConnectionString = await secretClient.GetSecretAsync("CosmosDbConnectionString");

builder.Configuration["AzureStorage:ConnectionString"] = blobConnectionString.Value;
builder.Configuration["AzureCosmos:ConnectionString"] = cosmosConnectionString.Value;


builder.Services.AddSingleton(secretClient);
builder.Services.AddOpenApi();
builder.Services.AddSingleton(x =>
    new BlobServiceClient(
        builder.Configuration["AzureStorage:ConnectionString"]));
builder.Services.AddSingleton<CosmosClient>(x=>
    new CosmosClient(
        builder.Configuration["AzureCosmos:ConnectionString"]));
builder.Services.AddScoped<AzureBlobService>();
builder.Services.AddScoped<CosmosDbService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();
builder.Services.AddAutoMapper(x=>x.AddProfile<MapperProfiles>());
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://victorious-plant-099cd7303.4.azurestaticapps.net")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Logging.AddConsole();
builder.Services.AddLogging();
var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowFrontend");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("ReactPolicy");
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.MapControllers();
app.Run();