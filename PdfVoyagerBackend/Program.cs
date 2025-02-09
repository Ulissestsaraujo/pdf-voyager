using Azure.Storage.Blobs;
using Microsoft.Azure.Cosmos;
using PdfVoyagerBackend;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Profiles;
using PdfVoyagerBackend.Services;

var builder = WebApplication.CreateBuilder(args);

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
app.UseCors("ReactPolicy");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.MapControllers();
app.Run();