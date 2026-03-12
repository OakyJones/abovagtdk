// GoCardless Bank Account Data API (formerly Nordigen)
// Docs: https://developer.gocardless.com/bank-account-data/overview
// Free open banking — PSD2/AISP read-only access

const BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

let cachedToken: { access: string; expires: number } | null = null;

/** Get access token (cached until expiry) */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.access;
  }

  const secretId = process.env.GOCARDLESS_SECRET_ID;
  const secretKey = process.env.GOCARDLESS_SECRET_KEY;

  if (!secretId || !secretKey) {
    throw new Error("GOCARDLESS_SECRET_ID og GOCARDLESS_SECRET_KEY mangler");
  }

  const res = await fetch(`${BASE_URL}/token/new/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret_id: secretId,
      secret_key: secretKey,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless token error: ${res.status} ${err}`);
  }

  const data = await res.json();
  // Token expires in access_expires seconds (usually 86400 = 24h)
  cachedToken = {
    access: data.access,
    expires: Date.now() + (data.access_expires - 60) * 1000, // 60s buffer
  };

  return data.access;
}

/** List institutions (banks) for a country */
export async function getInstitutions(country: string = "DK"): Promise<GoCardlessInstitution[]> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/institutions/?country=${country}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless institutions error: ${res.status} ${err}`);
  }

  return res.json();
}

/** Create a requisition (bank connection request) */
export async function createRequisition(params: {
  institutionId: string;
  redirectUrl: string;
  referenceId: string;
}): Promise<GoCardlessRequisition> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/requisitions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      redirect: params.redirectUrl,
      institution_id: params.institutionId,
      reference: params.referenceId,
      user_language: "DA",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless requisition error: ${res.status} ${err}`);
  }

  return res.json();
}

/** Get requisition by ID (to check status and get account IDs) */
export async function getRequisition(requisitionId: string): Promise<GoCardlessRequisition> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/requisitions/${requisitionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless get requisition error: ${res.status} ${err}`);
  }

  return res.json();
}

/** Get transactions for an account */
export async function getAccountTransactions(
  accountId: string,
  dateFrom?: string
): Promise<GoCardlessTransaction[]> {
  const token = await getAccessToken();

  const params = dateFrom ? `?date_from=${dateFrom}` : "";
  const res = await fetch(`${BASE_URL}/accounts/${accountId}/transactions/${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless transactions error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.transactions?.booked || [];
}

/** Get account details */
export async function getAccountDetails(accountId: string): Promise<{ iban?: string; name?: string; institution_id?: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/accounts/${accountId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GoCardless account error: ${res.status} ${err}`);
  }

  return res.json();
}

// Types

export interface GoCardlessInstitution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
}

export interface GoCardlessRequisition {
  id: string;
  status: string;
  institution_id: string;
  link: string;
  accounts: string[];
  reference: string;
  created: string;
}

export interface GoCardlessTransaction {
  transactionId?: string;
  bookingDate: string;
  valueDate?: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  creditorName?: string;
  debtorName?: string;
  additionalInformation?: string;
}
