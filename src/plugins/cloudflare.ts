// cloudflare.ts

const CF_ZONE_ID = process.env.CF_ZONE_ID as string;
const CF_API_TOKEN = process.env.CF_API_TOKEN as string;

export async function createCloudflareCustomHostname(hostname: string) {
  const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames`;

  const body = {
    hostname,
    ssl: {
      method: "cname",
      type: "dv",
      settings: { 
        min_tls_version: "1.2"
      }
    }
  };

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Authorization": `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.result; // ⬅ retorna somente o objeto result
}
