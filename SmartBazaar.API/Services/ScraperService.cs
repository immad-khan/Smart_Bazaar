using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;
using HtmlAgilityPack;
using Microsoft.Playwright;

namespace SmartBazaar.API.Services
{
    public class ScrapedProduct
    {
        public string Name { get; set; } = "";
        public string Price { get; set; } = "";
        public string Source { get; set; } = "";
        public string Link { get; set; } = "";
        public string Image { get; set; } = "";
    }

    public class ScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly string _userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

        public ScraperService()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", _userAgent);
            _httpClient.Timeout = TimeSpan.FromSeconds(15);
        }

        // 1. NAHEED (Fast HttpClient) ✅ WORKING
        public async Task<List<ScrapedProduct>> SearchNaheed(string keyword)
        {
            try
            {
                string url = $"https://www.naheed.pk/catalogsearch/result/?q={Uri.EscapeDataString(keyword)}";
                var html = await _httpClient.GetStringAsync(url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var nodes = doc.DocumentNode.SelectNodes("//li[contains(@class, 'product-item')]");
                return nodes?.Select(node => new ScrapedProduct
                {
                    Name = HttpUtility.HtmlDecode(node.SelectSingleNode(".//a[@class='product-item-link']")?.InnerText.Trim() ?? ""),
                    Price = node.SelectSingleNode(".//span[@data-price-type='finalPrice']//span[@class='price']")?.InnerText.Trim() ?? "",
                    Source = "Naheed",
                    Link = node.SelectSingleNode(".//a[@class='product-item-link']")?.GetAttributeValue("href", "") ?? "",
                    Image = node.SelectSingleNode(".//img[@class='product-image-photo']")?.GetAttributeValue("src", "") ?? ""
                }).ToList() ?? new List<ScrapedProduct>();
            }
            catch { return new List<ScrapedProduct>(); }
        }

        // 2. DINERS (Fast API Mode) ✅ WORKING
        public async Task<List<ScrapedProduct>> SearchDiners(string keyword)
        {
            try
            {
                string apiUrl = $"https://diners.com.pk/search/suggest.json?q={HttpUtility.UrlEncode(keyword)}&resources[type]=product";
                string response = await _httpClient.GetStringAsync(apiUrl);
                using JsonDocument doc = JsonDocument.Parse(response);
                
                var products = doc.RootElement.GetProperty("resources").GetProperty("results").GetProperty("products");
                var results = new List<ScrapedProduct>();

                foreach (var p in products.EnumerateArray())
                {
                    results.Add(new ScrapedProduct
                    {
                        Name = p.GetProperty("title").GetString() ?? "",
                        Price = "Rs. " + p.GetProperty("price").GetString(),
                        Source = "Diners",
                        Link = "https://diners.com.pk" + p.GetProperty("url").GetString(),
                        Image = p.GetProperty("image").GetString() ?? ""
                    });
                }
                return results;
            }
            catch { return new List<ScrapedProduct>(); }
        }

        // 3. PRICEOYE - 🔧 FIXED (Requires Playwright - JS Rendered)
        public async Task<List<ScrapedProduct>> SearchPriceOye(string keyword)
        {
            var results = new List<ScrapedProduct>();
            
            try
            {
                using var playwright = await Playwright.CreateAsync();
                await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions 
                { 
                    Headless = true 
                });
                
                var context = await browser.NewContextAsync(new BrowserNewContextOptions
                {
                    UserAgent = _userAgent
                });
                
                var page = await context.NewPageAsync();
                
                string url = $"https://priceoye.pk/search?q={HttpUtility.UrlEncode(keyword)}";
                await page.GotoAsync(url, new PageGotoOptions 
                { 
                    WaitUntil = WaitUntilState.NetworkIdle,
                    Timeout = 30000 
                });

                // Wait for products to load
                await page.WaitForSelectorAsync(".productBox, .product-box, [class*='product']", 
                    new PageWaitForSelectorOptions { Timeout = 10000 });
                
                // Additional wait for dynamic content
                await page.WaitForTimeoutAsync(2000);

                // Try multiple selector patterns for PriceOye
                var productSelectors = new[] 
                { 
                    ".productBox", 
                    ".product-box", 
                    "[class*='productBox']",
                    ".products-grid .product-item",
                    "a[href*='/product/']"
                };

                IReadOnlyList<IElementHandle>? items = null;
                
                foreach (var selector in productSelectors)
                {
                    items = await page.QuerySelectorAllAsync(selector);
                    if (items.Count > 0) break;
                }

                if (items == null || items.Count == 0)
                {
                    // Fallback: Get all product links
                    items = await page.QuerySelectorAllAsync("a[href*='/product/']");
                }

                foreach (var item in items.Take(15))
                {
                    try
                    {
                        // Get product name
                        string name = "";
                        var nameElem = await item.QuerySelectorAsync(".p-title, .product-title, h3, h4, [class*='title']");
                        if (nameElem != null)
                            name = (await nameElem.InnerTextAsync() ?? "").Trim();
                        else
                            name = (await item.InnerTextAsync() ?? "").Split('\n').FirstOrDefault()?.Trim() ?? "";

                        // Get price
                        string price = "";
                        var priceElem = await item.QuerySelectorAsync(".price-box, .price, [class*='price'], span:has-text('Rs')");
                        if (priceElem != null)
                            price = (await priceElem.InnerTextAsync() ?? "").Trim();

                        // Get link
                        string link = "";
                        var linkElem = await item.QuerySelectorAsync("a[href*='/product/']");
                        if (linkElem != null)
                            link = await linkElem.GetAttributeAsync("href") ?? "";
                        else
                            link = await item.GetAttributeAsync("href") ?? "";
                        
                        if (!link.StartsWith("http") && !string.IsNullOrEmpty(link))
                            link = "https://priceoye.pk" + link;

                        // Get image
                        string image = "";
                        var imgElem = await item.QuerySelectorAsync("img");
                        if (imgElem != null)
                        {
                            image = await imgElem.GetAttributeAsync("data-src") 
                                 ?? await imgElem.GetAttributeAsync("src") ?? "";
                        }

                        // Only add if valid data
                        if (!string.IsNullOrEmpty(name) && name.Length > 3)
                        {
                            results.Add(new ScrapedProduct
                            {
                                Name = HttpUtility.HtmlDecode(name),
                                Price = string.IsNullOrEmpty(price) ? "Check Website" : price,
                                Source = "PriceOye",
                                Link = link,
                                Image = image
                            });
                        }
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PriceOye Error: {ex.Message}");
            }

            return results;
        }

        // 4. LUNDA BAZAR ✅ WORKING
        public async Task<List<ScrapedProduct>> SearchLundaBazar(string keyword)
        {
            var results = new List<ScrapedProduct>();
            
            try
            {
                using var playwright = await Playwright.CreateAsync();
                await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions 
                { 
                    Headless = true 
                });
                var page = await browser.NewPageAsync();

                await page.GotoAsync($"https://lundabazaronline.com/search?q={HttpUtility.UrlEncode(keyword)}", 
                    new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle });
                
                await page.WaitForSelectorAsync(".grid__item, .product-card, .card", 
                    new PageWaitForSelectorOptions { Timeout = 10000 });

                var items = await page.QuerySelectorAllAsync(".grid__item, .product-card, .card--product");
                
                foreach (var item in items.Take(10))
                {
                    try
                    {
                        var linkElem = await item.QuerySelectorAsync("a[href*='/products/']");
#pragma warning disable CS8602 // Dereference of a possibly null reference.
                        string rawLink = await linkElem?.GetAttributeAsync("href") ?? "";
#pragma warning restore CS8602 // Dereference of a possibly null reference.
                        string fullLink = rawLink.StartsWith("http") ? rawLink : $"https://lundabazaronline.com{rawLink}";

                        var nameElem = await item.QuerySelectorAsync(".card__heading, .product-title, h3, a");
                        string name = nameElem != null ? (await nameElem.InnerTextAsync() ?? "").Trim() : "";

                        var priceElem = await item.QuerySelectorAsync(".price, .money, .price-item");
                        string price = priceElem != null ? (await priceElem.InnerTextAsync() ?? "").Trim() : "";

                        var imgElem = await item.QuerySelectorAsync("img");
                        string image = await imgElem?.GetAttributeAsync("src") 
                                    ?? await imgElem?.GetAttributeAsync("data-src") ?? "";
                        
                        if (!image.StartsWith("http") && !string.IsNullOrEmpty(image))
                            image = "https:" + image;

                        if (!string.IsNullOrEmpty(name))
                        {
                            results.Add(new ScrapedProduct
                            {
                                Name = HttpUtility.HtmlDecode(name),
                                Price = price,
                                Source = "LundaBazar",
                                Link = fullLink,
                                Image = image
                            });
                        }
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LundaBazar Error: {ex.Message}");
            }

            return results;
        }

        // 5. FARMGHAR - 🔧 COMPLETELY REWRITTEN
        public async Task<List<ScrapedProduct>> SearchFarmGhar(string keyword)
        {
            var results = new List<ScrapedProduct>();
            
            try
            {
                using var playwright = await Playwright.CreateAsync();
                await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions 
                { 
                    Headless = true 
                });
                
                var context = await browser.NewContextAsync(new BrowserNewContextOptions
                {
                    UserAgent = _userAgent
                });
                
                var page = await context.NewPageAsync();

                // FarmGhar search URL pattern
                string searchUrl = $"https://farmghar.com/search?q={HttpUtility.UrlEncode(keyword)}";
                
                await page.GotoAsync(searchUrl, new PageGotoOptions 
                { 
                    WaitUntil = WaitUntilState.NetworkIdle,
                    Timeout = 30000 
                });

                // Wait for content to load
                await page.WaitForTimeoutAsync(3000);

                // Try multiple selectors for FarmGhar products
                var productSelectors = new[]
                {
                    ".product-card",
                    ".product-item",
                    ".grid__item",
                    "[class*='product']",
                    ".card",
                    "a[href*='/products/']"
                };

                IReadOnlyList<IElementHandle>? items = null;
                
                foreach (var selector in productSelectors)
                {
                    items = await page.QuerySelectorAllAsync(selector);
                    if (items.Count > 0)
                    {
                        Console.WriteLine($"FarmGhar: Found {items.Count} items with selector: {selector}");
                        break;
                    }
                }

                // If no products found with selectors, try getting all links with images
                if (items == null || items.Count == 0)
                {
                    items = await page.QuerySelectorAllAsync("a:has(img)");
                }

                foreach (var item in items.Take(12))
                {
                    try
                    {
                        // Get link
                        string link = await item.GetAttributeAsync("href") ?? "";
                        var linkElem = await item.QuerySelectorAsync("a");
                        if (string.IsNullOrEmpty(link) && linkElem != null)
                            link = await linkElem.GetAttributeAsync("href") ?? "";
                        
                        if (!link.StartsWith("http") && !string.IsNullOrEmpty(link))
                            link = "https://farmghar.com" + link;

                        // Skip non-product links
                        if (!link.Contains("/products/") && !link.Contains("/collections/"))
                            continue;

                        // Get name
                        string name = "";
                        var nameSelectors = new[] { "h2", "h3", "h4", ".title", ".product-title", "[class*='title']", "span" };
                        foreach (var nameSelector in nameSelectors)
                        {
                            var nameElem = await item.QuerySelectorAsync(nameSelector);
                            if (nameElem != null)
                            {
                                name = (await nameElem.InnerTextAsync()).Trim();
                                if (!string.IsNullOrEmpty(name) && name.Length > 2) break;
                            }
                        }

                        // Get price
                        string price = "";
                        var priceSelectors = new[] { ".price", ".money", "[class*='price']", "span:has-text('Rs')" };
                        foreach (var priceSelector in priceSelectors)
                        {
                            var priceElem = await item.QuerySelectorAsync(priceSelector);
                            if (priceElem != null)
                            {
                                price = (await priceElem.InnerTextAsync()).Trim();
                                if (!string.IsNullOrEmpty(price)) break;
                            }
                        }

                        // Get image
                        string image = "";
                        var imgElem = await item.QuerySelectorAsync("img");
                        if (imgElem != null)
                        {
                            image = await imgElem.GetAttributeAsync("data-src")
                                 ?? await imgElem.GetAttributeAsync("data-srcset")
                                 ?? await imgElem.GetAttributeAsync("src") ?? "";
                            
                            // Handle srcset format
                            if (image.Contains(" "))
                                image = image.Split(' ').FirstOrDefault() ?? "";
                            
                            if (!image.StartsWith("http") && !string.IsNullOrEmpty(image))
                                image = "https:" + image;
                        }

                        if (!string.IsNullOrEmpty(name) || link.Contains("/products/"))
                        {
                            results.Add(new ScrapedProduct
                            {
                                Name = string.IsNullOrEmpty(name) ? "FarmGhar Product" : HttpUtility.HtmlDecode(name),
                                Price = string.IsNullOrEmpty(price) ? "Contact for Price" : price,
                                Source = "FarmGhar",
                                Link = link,
                                Image = image
                            });
                        }
                    }
                    catch { continue; }
                }

                // If still no results, try category page approach
                if (results.Count == 0)
                {
                    await page.GotoAsync("https://farmghar.com/collections/all", new PageGotoOptions 
                    { 
                        WaitUntil = WaitUntilState.NetworkIdle 
                    });
                    await page.WaitForTimeoutAsync(3000);

                    var allItems = await page.QuerySelectorAllAsync("a[href*='/products/']");
                    foreach (var item in allItems.Take(10))
                    {
                        try
                        {
                            string link = await item.GetAttributeAsync("href") ?? "";
                            if (!link.StartsWith("http"))
                                link = "https://farmghar.com" + link;

                            var parent = await item.EvaluateHandleAsync("el => el.closest('.product-card, .grid__item, .card')");
                            var parentElem = parent as IElementHandle;
                            
                            string name = "";
                            string price = "";
                            string image = "";

                            if (parentElem != null)
                            {
                                var nameElem = await parentElem.QuerySelectorAsync("h2, h3, .title");
                                name = nameElem != null ? (await nameElem.InnerTextAsync()).Trim() : "";

                                var priceElem = await parentElem.QuerySelectorAsync(".price, .money");
                                price = priceElem != null ? (await priceElem.InnerTextAsync()).Trim() : "";

                                var imgElem = await parentElem.QuerySelectorAsync("img");
                                if (imgElem != null)
                                    image = await imgElem.GetAttributeAsync("src") ?? "";
                            }

                            results.Add(new ScrapedProduct
                            {
                                Name = string.IsNullOrEmpty(name) ? "FarmGhar Product" : name,
                                Price = string.IsNullOrEmpty(price) ? "Contact for Price" : price,
                                Source = "FarmGhar",
                                Link = link,
                                Image = image
                            });
                        }
                        catch { continue; }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FarmGhar Error: {ex.Message}");
            }

            return results;
        }

        // MAIN SEARCH METHOD - Updated to use separate methods
        public async Task<List<ScrapedProduct>> SearchAll(string query)
        {
            var tasks = new List<Task<List<ScrapedProduct>>>
            {
                SearchNaheed(query),
                SearchDiners(query),
                SearchPriceOye(query),
                SearchLundaBazar(query),
                SearchFarmGhar(query)
            };

            await Task.WhenAll(tasks);

            var all = new List<ScrapedProduct>();
            foreach (var task in tasks)
            {
                try
                {
                    all.AddRange(await task);
                }
                catch { }
            }

            // Remove duplicates and empty entries
            return all
                .Where(p => !string.IsNullOrWhiteSpace(p.Name) && p.Name.Length > 3)
                .GroupBy(p => p.Link)
                .Select(g => g.First())
                .ToList();
        }
    }
}