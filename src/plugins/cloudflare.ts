// cloudflare.ts

const CF_ZONE_ID = process.env.CF_ZONE_ID as string;
const CF_API_TOKEN = process.env.CF_API_TOKEN as string;

export async function createCloudflareCustomHostname(hostname: string) {
  try {
    const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames`;

    const body = {
      hostname,
      ssl: {
        method: "txt",
        type: "dv",
        settings: { 
          min_tls_version: "1.2"
        }
      }
    };

    console.log(`[Cloudflare] Creating custom hostname: ${hostname}`);

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[Cloudflare] Failed to create custom hostname ${hostname}:`, {
        status: response.status,
        statusText: response.statusText,
        errors: data.errors,
        message: errorMessage,
      });
      throw new Error(`Cloudflare API error: ${errorMessage}`);
    }

    if (!data.success) {
      const errorMessage = data.errors?.[0]?.message || 'Unknown Cloudflare API error';
      console.error(`[Cloudflare] API returned success=false for ${hostname}:`, {
        errors: data.errors,
        message: errorMessage,
      });
      throw new Error(`Cloudflare API error: ${errorMessage}`);
    }

    if (!data.result) {
      console.error(`[Cloudflare] No result returned for ${hostname}:`, data);
      throw new Error('Cloudflare API returned no result');
    }

    console.log(`[Cloudflare] Successfully created custom hostname ${hostname}:`, {
      id: data.result.id,
      status: data.result.status,
    });

    return data.result;
  } catch (error: any) {
    console.error(`[Cloudflare] Exception while creating custom hostname ${hostname}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}
