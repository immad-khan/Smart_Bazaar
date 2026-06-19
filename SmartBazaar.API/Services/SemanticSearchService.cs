using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SmartBazaar.API.Services;

public class SemanticSearchService
{
    private readonly IConfiguration _configuration;

    public SemanticSearchService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task InitializeCollectionAsync()
    {
        // Qdrant integration removed. No-op.
        return Task.CompletedTask;
    }

    public Task<List<object>> SearchSimilarProductsAsync(float[] queryVector, int limit = 20)
    {
        // Returns empty list since Qdrant is disabled.
        return Task.FromResult(new List<object>());
    }

    public Task IndexProductAsync(int productId, float[] embedding, Dictionary<string, object> metadata)
    {
        // No-op – indexing disabled.
        return Task.CompletedTask;
    }

    public Task DeleteProductAsync(int productId)
    {
        // No-op – deletion disabled.
        return Task.CompletedTask;
    }
}
