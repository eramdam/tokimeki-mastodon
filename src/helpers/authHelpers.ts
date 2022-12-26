import { login } from "masto";

export async function registerApplication(instanceURL: string, origin: string) {
  const masto = await login({
    url: instanceURL,
  });

  return await masto.v1.apps.create({
    clientName: process.env.NEXT_PUBLIC_CLIENT_NAME || "",
    // redirectUris: "urn:ietf:wg:oauth:2.0:oob",
    redirectUris: `${origin}`,
    scopes: "read write follow",
    website: origin,
  });
}

export function getAuthURL(opts: { clientId: string; instanceUrl: string }) {
  const authorizationParams = new URLSearchParams({
    client_id: opts.clientId,
    scope: "read write follow",
    redirect_uri: `${location.origin}`,
    response_type: "code",
  });
  const authorizationURL = `https://${opts.instanceUrl.replace(
    /https?:\/\//,
    ""
  )}/oauth/authorize?${authorizationParams.toString()}`;

  return authorizationURL;
}

export async function getAccessToken(opts: {
  clientId: string;
  instanceUrl: string;
  clientSecret: string;
  code: string;
}): Promise<{ access_token: string } | null> {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    client_secret: opts.clientSecret,
    redirect_uri: location.origin,
    grant_type: "authorization_code",
    code: opts.code,
    scope: "read write follow",
  });
  const tokenResponse = await fetch(
    `https://${opts.instanceUrl.replace(/https?:\/\//, "")}/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );
  const tokenJSON = await tokenResponse.json();
  return tokenJSON;
}
