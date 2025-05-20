import dotenv from "dotenv";

dotenv.config();

export async function handler(event, context) {
  const prerenderToken = process.env.PRERENDER_TOKEN; // Your prerender.io API token

  // Construct URL to prerender.io service, append the original path/query
  const urlToRender = `https://service.prerender.io${event.path}${
    event.rawQueryString ? "?" + event.rawQueryString : ""
  }`;

  try {
    const response = await fetch(urlToRender, {
      headers: {
        "X-Prerender-Token": prerenderToken,
        "User-Agent": event.headers["user-agent"] || "",
        Accept: event.headers["accept"] || "",
      },
    });

    const body = await response.text();
    console.log("Prerender:", body);

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/html",
      },
      body,
    };
  } catch (error) {
    // If anything goes wrong, fallback to sending your SPA index.html
    return {
      statusCode: 500,
      body: `Error fetching prerendered page: ${error.message}`,
    };
  }
}
