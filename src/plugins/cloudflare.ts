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
          min_tls_version: "1.2",
        },
      },
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

    if (!response.ok || !data.success) {
      const errorMessage = data.errors?.[0]?.message || "Unknown Cloudflare API error";
      console.error(`[Cloudflare] Error creating hostname ${hostname}:`, data);
      throw new Error(errorMessage);
    }

    const result = data.result;

    // 🔥 Segunda etapa: pegar ACME challenge
    const hostnameInfo = await getCloudflareHostnameInfo(result.id);

    // Pega o TXT do SSL (ACME)
    const sslValidation = hostnameInfo.ssl?.validation_records?.[0];

    return {
      id: result.id,
      status: result.status,
      ownership: result.ownership_verification,
      sslValidation: sslValidation
        ? {
          txtName: sslValidation.txt_name,
          txtValue: sslValidation.txt_value,
        }
        : null,
    };

  } catch (error: any) {
    console.error(`[Cloudflare] Exception: ${error.message}`);
    throw error;
  }
}


export async function getCloudflareHostnameInfo(hostnameId: string) {
  try {
    const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames/${hostnameId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[Cloudflare] Failed to fetch hostname info ${hostnameId}:`, data);
      throw new Error(`Cloudflare API error: ${errorMessage}`);
    }

    console.log(`[Cloudflare] Hostname ${hostnameId} fetched successfully`);
    return data.result;

  } catch (error: any) {
    console.error(`[Cloudflare] Exception while fetching hostname info ${hostnameId}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}
