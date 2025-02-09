using System.Net;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace PdfVoyagerBackend.Middlewares;

public class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            // Ensure the exception is properly logged
            logger.LogError(ex, "Unhandled exception occurred while processing request: {Path}", context.Request.Path);
            
            // Handle the exception and return a proper response
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        logger.LogError(exception, "Exception caught by middleware");

        // Setup default error response
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            StatusCode = (int)HttpStatusCode.InternalServerError,
            Message = "An unexpected error occurred. Please try again later.",
            Details = exception.Message // Full details in development
        };

        // Adjust response based on exception type
        switch (exception)
        {
            case CosmosException cosmosException:
                response.StatusCode = (int)cosmosException.StatusCode;
                errorResponse.Message = "A database error occurred.";
                errorResponse.Details = cosmosException.Message; // Optional for debugging
                logger.LogWarning("Cosmos DB error: {Message}", cosmosException.Message);
                break;

            case ArgumentNullException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = "Missing required parameters.";
                logger.LogWarning("Bad request: Missing parameters.");
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = "Unauthorized access.";
                logger.LogWarning("Unauthorized access attempt.");
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                logger.LogCritical(exception, "Unhandled application error.");
                break;
        }

        // Serialize and return the response
        var jsonResponse = JsonConvert.SerializeObject(errorResponse);
        await response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string? Details { get; set; }
}