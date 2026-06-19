/**
 * SmartBazaar Load Balancer - Cloudflare Worker
 * 
 * Distributes traffic between:
 *   - Instance 1: Azure App Service (Central India)
 *   - Instance 2: Render.com (Oregon, US West)
 * 
 * Strategy: Round-Robin with automatic failover
 */

const BACKENDS = [
  {
    name: "Azure-CentralIndia",
    url: "https://smartbazaar-api-amb2h4czg4a9ggcw.centralindia-01.azurewebsites.net",
  },
  {
    name: "Render-USWest",
    url: "https://smart-bazaar-i161.onrender.com",
  },
];

// Using Cloudflare's global state for round-robin counter
let requestCounter = 0;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint — shows status of all backends
    if (url.pathname === "/lb-health") {
      return await healthCheck();
    }

    // Pick backend using round-robin
    const backendIndex = requestCounter % BACKENDS.length;
    requestCounter++;
    const primary = BACKENDS[backendIndex];
    const fallback = BACKENDS[(backendIndex + 1) % BACKENDS.length];

    // Try primary backend first, fall back to secondary if it fails
    try {
      const response = await forwardRequest(request, primary.url);

      // If primary returns a server error (5xx), try fallback
      if (response.status >= 500) {
        console.log(`Primary (${primary.name}) returned ${response.status}, trying fallback...`);
        return await forwardRequest(request, fallback.url, primary.name);
      }

      // Add header to show which backend served the request
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Served-By", primary.name);
      newHeaders.set("X-Load-Balancer", "SmartBazaar-CF-Worker");
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

    } catch (primaryError) {
      console.log(`Primary (${primary.name}) failed: ${primaryError.message}, trying fallback...`);

      try {
        return await forwardRequest(request, fallback.url, primary.name);
      } catch (fallbackError) {
        // Both backends are down
        return new Response(
          JSON.stringify({
            error: "All backends are unavailable",
            primaryBackend: primary.name,
            fallbackBackend: fallback.name,
            message: "SmartBazaar API is temporarily unavailable. Please try again later.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "X-Load-Balancer": "SmartBazaar-CF-Worker",
            },
          }
        );
      }
    }
  },
};

/**
 * Forward a request to a backend server
 */
async function forwardRequest(originalRequest, backendUrl, failedBackend = null) {
  const url = new URL(originalRequest.url);
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

  // Handle CORS preflight
  if (originalRequest.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const forwardedRequest = new Request(targetUrl, {
    method: originalRequest.method,
    headers: originalRequest.headers,
    body: originalRequest.method !== "GET" && originalRequest.method !== "HEAD"
      ? originalRequest.body
      : undefined,
    redirect: "follow",
  });

  const response = await fetch(forwardedRequest);

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "*");
  newHeaders.set("X-Load-Balancer", "SmartBazaar-CF-Worker");
  if (failedBackend) {
    newHeaders.set("X-Failed-Backend", failedBackend);
    newHeaders.set("X-Served-By", "Fallback");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Health check — pings all backends and reports status
 */
async function healthCheck() {
  const results = await Promise.allSettled(
    BACKENDS.map(async (backend) => {
      const start = Date.now();
      try {
        const res = await fetch(`${backend.url}/`, {
          signal: AbortSignal.timeout(5000),
        });
        return {
          name: backend.name,
          url: backend.url,
          status: res.ok ? "healthy" : "degraded",
          httpStatus: res.status,
          responseTimeMs: Date.now() - start,
        };
      } catch (e) {
        return {
          name: backend.name,
          url: backend.url,
          status: "down",
          error: e.message,
          responseTimeMs: Date.now() - start,
        };
      }
    })
  );

  const backends = results.map((r) => r.value || r.reason);
  const allDown = backends.every((b) => b.status === "down");

  return new Response(
    JSON.stringify({
      loadBalancer: "SmartBazaar-CF-Worker",
      strategy: "Round-Robin with Failover",
      overallStatus: allDown ? "DOWN" : "OK",
      backends,
      timestamp: new Date().toISOString(),
    }, null, 2),
    {
      status: allDown ? 503 : 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
