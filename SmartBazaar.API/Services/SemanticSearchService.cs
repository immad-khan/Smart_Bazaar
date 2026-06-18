using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SmartBazaar.API.Services;

public class SemanticSearchService
{
    private readonly IConfiguration _configuration;
    private const string CollectionName = "products";

    public SemanticSearchService(IConfiguration configuration)
    {
        _configuration = configuration;
        Console.WriteLine("⚠️ Qdrant integration disabled. Semantic search will return no results.");
    }

    public Task InitializeCollectionAsync()
    {
        // No-op since Qdrant is not used.
        return Task.CompletedTask;
    }

    public async Task<List<ScoredPoint>> SearchSimilarProductsAsync(float[] queryVector, int limit = 20)
    {
        // Return empty result set.
        return new List<ScoredPoint>();
    }

    public async Task IndexProductAsync(int productId, float[] embedding, Dictionary<string, object> metadata)
    {
        // No-op – indexing is disabled.
        await Task.CompletedTask;
    }

    public async Task DeleteProductAsync(int productId)
    {
        // No-op – deletion disabled.
        await Task.CompletedTask;
    }
}

public class ScoredPoint
{
    public ulong Id { get; set; }
    public float Score { get; set; }
    public Dictionary<string, Value> Payload { get; set; } = new();
}
