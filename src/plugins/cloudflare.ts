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

    console.log(`[Cloudflare] Create hostname response status: ${response.status}`, {
      success: data.success,
      resultId: data.result?.id,
      resultStatus: data.result?.status,
      resultHostname: data.result?.hostname,
      errors: data.errors,
    });

    if (!response.ok || !data.success) {
      const errorMessage = data.errors?.[0]?.message || "Unknown Cloudflare API error";
      console.error(`[Cloudflare] Error creating hostname ${hostname}:`, {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2),
      });
      throw new Error(errorMessage);
    }

    const result = data.result;

    if (!result || !result.id) {
      console.error('[Cloudflare] Invalid result from create hostname API:', {
        result,
        fullData: data,
      });
      throw new Error('Cloudflare API returned invalid result (missing id)');
    }

    console.log('[Cloudflare] Hostname created successfully:', {
      id: result.id,
      hostname: result.hostname,
      status: result.status,
      ssl: result.ssl ? 'present' : 'missing',
    });

    // Retornar apenas os dados da criação
    // O SSL validation será buscado posteriormente via getCloudflareHostnameInfo
    return {
      id: result.id,
      status: result.status,
      ownership: result.ownership_verification,
    };

  } catch (error: any) {
    console.error(`[Cloudflare] Exception: ${error.message}`);
    throw error;
  }
}


export async function getCloudflareHostnameInfo(hostnameId: string) {
  try {
    const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames/${hostnameId}`;

    console.log('[Cloudflare] Fetching hostname info:', {
      hostnameId,
      url,
      zoneId: CF_ZONE_ID ? 'present' : 'missing',
      apiToken: CF_API_TOKEN ? 'present' : 'missing',
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log('[Cloudflare] Get hostname response:', {
      status: response.status,
      statusText: response.statusText,
      success: data.success,
      resultId: data.result?.id,
      resultHostname: data.result?.hostname,
      resultStatus: data.result?.status,
      hasSsl: !!data.result?.ssl,
      hasValidationRecords: !!data.result?.ssl?.validation_records,
      validationRecordsCount: data.result?.ssl?.validation_records?.length || 0,
      errors: data.errors,
    });

    // Tratamento especial para 404 - hostname não encontrado
    if (response.status === 404) {
      const errorCode = data.errors?.[0]?.code;
      const errorMessage = data.errors?.[0]?.message || 'The custom hostname was not found';
      
      console.error('[Cloudflare] Hostname not found (404):', {
        hostnameId,
        errorCode,
        errorMessage,
        possibleReasons: [
          'Hostname was deleted in Cloudflare',
          'Hostname ID is incorrect',
          'Hostname belongs to a different zone',
          'Hostname was never created successfully',
        ],
        fullResponse: JSON.stringify(data, null, 2),
      });
      
      // Criar erro customizado para facilitar tratamento
      const error: any = new Error(`Cloudflare API error: ${errorMessage}`);
      error.code = errorCode;
      error.statusCode = 404;
      error.hostnameId = hostnameId;
      throw error;
    }

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[Cloudflare] Failed to fetch hostname info ${hostnameId}:`, {
        status: response.status,
        statusText: response.statusText,
        errorCode: data.errors?.[0]?.code,
        errorMessage,
        fullResponse: JSON.stringify(data, null, 2),
      });
      throw new Error(`Cloudflare API error: ${errorMessage}`);
    }

    if (!data.success) {
      console.error(`[Cloudflare] API returned success=false for hostname ${hostnameId}:`, {
        errors: data.errors,
        fullResponse: JSON.stringify(data, null, 2),
      });
      throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
    }

    if (!data.result) {
      console.error(`[Cloudflare] No result returned for hostname ${hostnameId}:`, {
        fullResponse: JSON.stringify(data, null, 2),
      });
      throw new Error('Cloudflare API returned no result');
    }

    console.log(`[Cloudflare] Hostname ${hostnameId} fetched successfully:`, {
      id: data.result.id,
      hostname: data.result.hostname,
      status: data.result.status,
      sslStatus: data.result.ssl?.status,
      validationRecords: data.result.ssl?.validation_records?.map((r: any) => ({
        txt_name: r.txt_name,
        txt_value: r.txt_value ? `${r.txt_value.substring(0, 20)}...` : null,
      })),
    });

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
