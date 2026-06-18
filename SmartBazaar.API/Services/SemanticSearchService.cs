using Qdrant.Client;
using Qdrant.Client.Grpc;

namespace SmartBazaar.API.Services;

public class SemanticSearchService
{
    private readonly QdrantClient _qdrantClient;
    private readonly IConfiguration _configuration;
    private const string CollectionName = "products";

    public SemanticSearchService(IConfiguration configuration)
    {
        _configuration = configuration;
        // Docker passes Qdrant__Url as environment variable, which becomes Qdrant:Url in config
        var qdrantUrl = _configuration["Qdrant:Url"] ?? _configuration["Qdrant__Url"] ?? "localhost";
        // Remove http:// or https:// prefix if present
        qdrantUrl = qdrantUrl.Replace("http://", "").Replace("https://", "");
        var qdrantPortStr = _configuration["Qdrant:Port"] ?? _configuration["Qdrant__Port"] ?? "6334";  // Use gRPC port
        var qdrantPort = int.Parse(qdrantPortStr);
        
        Console.WriteLine($"🔗 Attempting to connect to Qdrant at {qdrantUrl}:{qdrantPort}");
        try
        {
            _qdrantClient = new QdrantClient(qdrantUrl, qdrantPort);
            Console.WriteLine($"✅ Successfully connected to Qdrant");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Qdrant not available: {ex.Message}");
            Console.WriteLine($"ℹ️ Semantic search will be disabled. Ensure Qdrant is running on {qdrantUrl}:{qdrantPort}");
            _qdrantClient = null!;
        }
    }

    public async Task InitializeCollectionAsync()
    {
        if (_qdrantClient == null)
        {
            Console.WriteLine("⚠️ Qdrant client is null. Semantic search disabled.");
            return;
        }

        try
        {
            // Test connection first
            Console.WriteLine("🔄 Testing Qdrant connection...");
            var collections = await _qdrantClient.ListCollectionsAsync();
            Console.WriteLine($"✅ Connected to Qdrant. Found {collections.Count()} collections.");
            
            var collectionExists = collections.Any(c => c == CollectionName);

            if (!collectionExists)
            {
                Console.WriteLine($"📦 Creating collection: {CollectionName}");
                await _qdrantClient.CreateCollectionAsync(
                    collectionName: CollectionName,
                    vectorsConfig: new VectorParams
                    {
                        Size = 512, // CLIP embedding size
                        Distance = Distance.Cosine
                    }
                );
                Console.WriteLine($"✅ Created collection: {CollectionName}");
            }
            else
            {
                Console.WriteLine($"✅ Collection '{CollectionName}' already exists");
            }
        }
        catch (Grpc.Core.RpcException ex) when (ex.StatusCode == Grpc.Core.StatusCode.Unavailable)
        {
            Console.WriteLine($"❌ Qdrant is not running or unreachable");
            Console.WriteLine($"   Please start Qdrant: docker start qdrant");
            Console.WriteLine($"   Or run: docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant:latest");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Qdrant initialization failed: {ex.GetType().Name}");
            Console.WriteLine($"   Message: {ex.Message}");
        }
    }

    public async Task<List<ScoredPoint>> SearchSimilarProductsAsync(float[] queryVector, int limit = 20)
    {
        if (_qdrantClient == null)
            return new List<ScoredPoint>();

        try
        {
            var results = await _qdrantClient.SearchAsync(
                collectionName: CollectionName,
                vector: queryVector,
                limit: (ulong)limit,
                scoreThreshold: 0.7f // Only return results with >70% similarity
            );

            return results.ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Search error: {ex.Message}");
            return new List<ScoredPoint>();
        }
    }

    public async Task IndexProductAsync(int productId, float[] embedding, Dictionary<string, object> metadata)
    {
        if (_qdrantClient == null)
            return;

        try
        {
            var payload = new Dictionary<string, Value>();
            foreach (var kvp in metadata)
            {
                // Store typed values for proper filtering
                if (kvp.Value == null)
                {
                    payload[kvp.Key] = new Value { NullValue = NullValue.NullValue };
                }
                else if (kvp.Value is int intVal)
                {
                    payload[kvp.Key] = new Value { IntegerValue = intVal };
                }
                else if (kvp.Value is long longVal)
                {
                    payload[kvp.Key] = new Value { IntegerValue = longVal };
                }
                else if (kvp.Value is double doubleVal)
                {
                    payload[kvp.Key] = new Value { DoubleValue = doubleVal };
                }
                else if (kvp.Value is decimal decimalVal)
                {
                    payload[kvp.Key] = new Value { DoubleValue = (double)decimalVal };
                }
                else if (kvp.Value is bool boolVal)
                {
                    payload[kvp.Key] = new Value { BoolValue = boolVal };
                }
                else
                {
                    payload[kvp.Key] = new Value { StringValue = kvp.Value.ToString() ?? "" };
                }
            }

            var point = new PointStruct
            {
                Id = new PointId { Num = (ulong)productId },
                Vectors = embedding,
                Payload = { payload }
            };

            await _qdrantClient.UpsertAsync(CollectionName, new[] { point });
            Console.WriteLine($"✅ Indexed product {productId} with {metadata.Count} metadata fields");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Indexing error for product {productId}: {ex.Message}");
        }
    }

    public async Task DeleteProductAsync(int productId)
    {
        if (_qdrantClient == null)
            return;

        try
        {
            await _qdrantClient.DeleteAsync(
                collectionName: CollectionName,
                ids: new[] { new PointId { Num = (ulong)productId } }
            );
            Console.WriteLine($"✅ Deleted product {productId} from vector index");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Delete error for product {productId}: {ex.Message}");
        }
    }
}
