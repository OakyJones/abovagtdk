// Tink API client
// Docs: https://docs.tink.com

const TINK_BASE_URL = "https://api.tink.com";

interface TinkTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/** Get a client access token (app-level, no user context) */
export async function getClientToken(scope: string): Promise<string> {
  const res = await fetch(`${TINK_BASE_URL}/api/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TINK_CLIENT_ID || "",
      client_secret: process.env.TINK_CLIENT_SECRET || "",
      grant_type: "client_credentials",
      scope,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink client token error: ${res.status} ${err}`);
  }

  const data: TinkTokenResponse = await res.json();
  return data.access_token;
}

/** Create a Tink user and get an authorization code */
export async function createTinkUser(externalUserId: string): Promise<string> {
  const token = await getClientToken("user:create");

  const res = await fetch(`${TINK_BASE_URL}/api/v1/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      external_user_id: externalUserId,
      market: "DK",
      locale: "da_DK",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    // User might already exist — try to get auth code instead
    if (res.status === 409) {
      return getAuthorizationCode(externalUserId);
    }
    throw new Error(`Tink create user error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.user_id;
}

/** Get authorization code for existing user */
export async function getAuthorizationCode(externalUserId: string): Promise<string> {
  const token = await getClientToken("authorization:grant");

  const res = await fetch(`${TINK_BASE_URL}/api/v1/oauth/authorization-grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams({
      external_user_id: externalUserId,
      scope: "user:read,accounts:read,transactions:read,credentials:read",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink auth code error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.code;
}

/** Exchange authorization code for user access token */
export async function getUserToken(code: string): Promise<string> {
  const res = await fetch(`${TINK_BASE_URL}/api/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TINK_CLIENT_ID || "",
      client_secret: process.env.TINK_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink user token error: ${res.status} ${err}`);
  }

  const data: TinkTokenResponse = await res.json();
  return data.access_token;
}

/** Get user access token via delegation grant */
export async function getDelegatedToken(externalUserId: string): Promise<string> {
  const code = await getAuthorizationCode(externalUserId);
  return getUserToken(code);
}

/** Fetch transactions for a user */
export async function getTransactions(
  userToken: string,
  fromDate?: string
): Promise<TinkTransaction[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set("queryTag", `from:${fromDate}`);

  // Use search endpoint for date filtering
  const threeMonthsAgo = fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const res = await fetch(
    `${TINK_BASE_URL}/data/v2/transactions?pageSize=500&dateGte=${threeMonthsAgo}`,
    {
      headers: { Authorization: `Bearer ${userToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink transactions error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return (data.transactions || []) as TinkTransaction[];
}

/** Fetch accounts for a user */
export async function getAccounts(userToken: string) {
  const res = await fetch(`${TINK_BASE_URL}/data/v2/accounts`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink accounts error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.accounts || [];
}

/** Build Tink Link URL */
export function buildTinkLinkUrl(params: {
  clientId: string;
  redirectUri: string;
  market?: string;
  locale?: string;
  authorizationCode?: string;
}): string {
  const base = "https://link.tink.com/1.0/transactions/connect-accounts";
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    market: params.market || "DK",
    locale: params.locale || "da_DK",
  });

  if (params.authorizationCode) {
    searchParams.set("authorization_code", params.authorizationCode);
  }

  return `${base}?${searchParams.toString()}`;
}

export interface TinkTransaction {
  id: string;
  accountId: string;
  amount: {
    value: { unscaledValue: string; scale: string };
    currencyCode: string;
  };
  descriptions: {
    original: string;
    display: string;
  };
  dates: {
    booked: string;
  };
  categories?: {
    pfm?: { id: string; name: string };
  };
  status: string;
  types?: {
    type: string;
  };
}

/** Parse Tink amount (unscaled) to number */
export function parseTinkAmount(amount: TinkTransaction["amount"]): number {
  const unscaled = parseInt(amount.value.unscaledValue, 10);
  const scale = parseInt(amount.value.scale, 10);
  return Math.abs(unscaled / Math.pow(10, scale));
}
