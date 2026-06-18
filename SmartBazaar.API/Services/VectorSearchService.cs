using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using Qdrant.Client.Grpc;

namespace SmartBazaar.API.Services;

public class VectorSearchService
{
    private readonly InferenceSession _session;
    private readonly SemanticSearchService _semanticSearch;

    public VectorSearchService(IConfiguration configuration, SemanticSearchService semanticSearch)
    {
        _semanticSearch = semanticSearch;
        
        // Load the CLIP model from AIModels folder
        var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AIModels", "clip-vision.onnx");
        
        if (!File.Exists(modelPath))
        {
            throw new FileNotFoundException($"CLIP model not found at: {modelPath}");
        }
        
        Console.WriteLine($"✅ Loading CLIP model from: {modelPath}");
        _session = new InferenceSession(modelPath);
        
        // Debug: Print input and output names
        var inputNames = _session.InputMetadata.Keys.ToArray();
        var outputNames = _session.OutputMetadata.Keys.ToArray();
        Console.WriteLine($"📋 Model Input Names: {string.Join(", ", inputNames)}");
        Console.WriteLine($"📋 Model Output Names: {string.Join(", ", outputNames)}");
        Console.WriteLine("✅ CLIP model loaded successfully!");
    }

    /// <summary>
    /// Convert an uploaded image to a vector embedding using CLIP
    /// </summary>
    public float[] GetImageEmbedding(Stream imageStream)
    {
        try
        {
            using var image = SixLabors.ImageSharp.Image.Load<Rgb24>(imageStream);
            
            // CLIP requires exactly 224x224 pixels
            image.Mutate(x => x.Resize(new ResizeOptions 
            { 
                Size = new Size(224, 224), 
                Mode = ResizeMode.Crop 
            }));

            // Convert image to the format the AI understands (Tensor)
            var tensor = new DenseTensor<float>(new[] { 1, 3, 224, 224 });
            
            image.ProcessPixelRows(accessor => 
            {
                for (int y = 0; y < accessor.Height; y++) 
                {
                    var row = accessor.GetRowSpan(y);
                    for (int x = 0; x < accessor.Width; x++) 
                    {
                        // Normalize pixel values (ImageNet normalization)
                        tensor[0, 0, y, x] = (row[x].R / 255f - 0.481f) / 0.268f; // Red channel
                        tensor[0, 1, y, x] = (row[x].G / 255f - 0.457f) / 0.261f; // Green channel
                        tensor[0, 2, y, x] = (row[x].B / 255f - 0.408f) / 0.275f; // Blue channel
                    }
                }
            });

            // Run the AI model - use the actual input name from the model
            var inputName = _session.InputMetadata.Keys.First();
            var inputs = new List<NamedOnnxValue> 
            { 
                NamedOnnxValue.CreateFromTensor(inputName, tensor) 
            };
            
            using var results = _session.Run(inputs);
            var embedding = results.First().AsEnumerable<float>().ToArray();
            
            Console.WriteLine($"✅ Generated image embedding: {embedding.Length} dimensions");
            return embedding;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error generating image embedding: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Search for products similar to an uploaded image
    /// </summary>
    public async Task<List<ScoredPoint>> SearchByImageAsync(Stream imageStream, int limit = 20)
    {
        var imageEmbedding = GetImageEmbedding(imageStream);
        var results = await _semanticSearch.SearchSimilarProductsAsync(imageEmbedding, limit);
        
        Console.WriteLine($"🔍 Found {results.Count} similar products for image");
        return results;
    }

    /// <summary>
    /// Generate embedding for text (product name/description)
    /// Uses a simple TF-IDF-like approach with common vocabulary
    /// </summary>
    public float[] GetTextEmbedding(string text)
    {
        // Simple vocabulary-based embedding (512 dimensions)
        // Each word contributes to specific dimensions based on hash
        var embedding = new float[512];
        var words = text.ToLowerInvariant()
            .Split(new[] { ' ', ',', '.', '!', '?', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
        
        if (words.Length == 0)
        {
            return embedding;
        }

        foreach (var word in words)
        {
            var hash = Math.Abs(word.GetHashCode());
            // Each word contributes to multiple dimensions
            for (int i = 0; i < 5; i++)
            {
                var idx = (hash + i * 37) % 512;
                embedding[idx] += 1.0f;
            }
        }

        // Normalize the vector
        var magnitude = (float)Math.Sqrt(embedding.Sum(x => x * x));
        if (magnitude > 0)
        {
            for (int i = 0; i < embedding.Length; i++)
            {
                embedding[i] /= magnitude;
            }
        }

        return embedding;
    }

    /// <summary>
    /// Search for products similar to text query
    /// </summary>
    public async Task<List<ScoredPoint>> SearchByTextAsync(string query, int limit = 20)
    {
        var textEmbedding = GetTextEmbedding(query);
        var results = await _semanticSearch.SearchSimilarProductsAsync(textEmbedding, limit);
        
        Console.WriteLine($"🔍 Found {results.Count} similar products for text: {query}");
        return results;
    }
}
