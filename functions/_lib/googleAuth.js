// Exchanges a Google service account key for a short-lived OAuth2 access
// token, so we can call Google Cloud APIs (Speech-to-Text, Translation)
// without a simple API key. Cloudflare Workers don't have Node's `crypto`
// module, so this uses the standard Web Crypto API (available globally).

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function arrayBufferToBase64Url(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Converts a PEM-formatted private key (as found in a service account JSON)
// into a CryptoKey usable for signing.
async function importPrivateKey(pem) {
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryDer = atob(pemContents);
  const bytes = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    bytes[i] = binaryDer.charCodeAt(i);
  }
  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/**
 * Gets a Google OAuth2 access token for the given scope(s), using the
 * service account credentials stored in the GOOGLE_SERVICE_ACCOUNT_KEY
 * Cloudflare secret (the full JSON key file contents, as a string).
 *
 * @param {string} serviceAccountJsonString - raw JSON string from env
 * @param {string} scope - space-separated OAuth scopes
 * @returns {Promise<string>} access token
 */
export async function getGoogleAccessToken(serviceAccountJsonString, scope) {
  const credentials = JSON.parse(serviceAccountJsonString);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: credentials.client_email,
    scope,
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedJwt = `${encodedHeader}.${encodedClaimSet}`;

  const key = await importPrivateKey(credentials.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedJwt)
  );

  const signedJwt = `${unsignedJwt}.${arrayBufferToBase64Url(signature)}`;

  const tokenResponse = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    throw new Error(`Google auth failed: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}
