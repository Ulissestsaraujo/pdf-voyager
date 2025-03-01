using System.Text;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PdfVoyagerBackend.DbContext;
using PdfVoyagerBackend.Middlewares;
using PdfVoyagerBackend.Profiles;
using PdfVoyagerBackend.Services;

var builder = WebApplication.CreateBuilder(args);
var keyVaultUri = new Uri("https://pdf-voyager-kv.vault.azure.net/");
var secretClient = new SecretClient(keyVaultUri, new DefaultAzureCredential());

KeyVaultSecret blobConnectionString = await secretClient.GetSecretAsync("BlobStorageConnectionString");
KeyVaultSecret mySqlConnectionString = await secretClient.GetSecretAsync("MySqlConnectionString");
KeyVaultSecret jwtSecret = await secretClient.GetSecretAsync("JwtSecret");

builder.Configuration["Jwt:Secret"] = jwtSecret.Value;
builder.Configuration["AzureStorage:ConnectionString"] = blobConnectionString.Value;
builder.Configuration["MySql:ConnectionString"] = mySqlConnectionString.Value;

builder.Services.AddAuthorization();

builder.Services.AddSingleton(secretClient);
builder.Services.AddOpenApi();
builder.Services.AddSingleton(x =>
    new BlobServiceClient(
        builder.Configuration["AzureStorage:ConnectionString"]));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration["MySql:ConnectionString"],
        ServerVersion.AutoDetect(builder.Configuration["MySql:ConnectionString"])
    )
);
// Add JWT Authentication
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]))
        };
        
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["accessToken"];
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                if (context.AuthenticateFailure is SecurityTokenExpiredException)
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    return context.Response.WriteAsync("{\"message\": \"Token expired\"}");
                }

                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddScoped<AzureBlobService>();
builder.Services.AddScoped<DbService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();
builder.Services.AddAutoMapper(x=>x.AddProfile<MapperProfiles>());
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://pdfvoyager.com", "https://www.pdfvoyager.com", "https://api.pdfvoyager.com")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Logging.AddConsole();
builder.Services.AddLogging();
var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    ForwardLimit = null,
    RequireHeaderSymmetry = false
});
if(!app.Environment.IsDevelopment())
{
    app.UseCors("AllowFrontend");
}
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("ReactPolicy");
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

// app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
