// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime on Supabase Edge Functions; types differ from Node.
//
// Adobe IMS token refresh Edge Function.
//
// Invoked by a pg_cron job every 10 minutes. Picks integrations whose access
// token expires in the next hour, requests a new one via OAuth Server-to-Server,
// writes the new token + expiry back. Errors are written to
// `integrations.adobe_refresh_error` so the agency UI can surface stuck creds.
//
// Governing doc: docs/features/data-acquisition.md
//
// Auth model: **OAuth Server-to-Server**. JWT grant is deprecated — do not use.
// Scope: openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_pc.dma_tartan
//   (Analytics API scope was renamed from read_pc.aa_api in 2024.)
//
// Security: the function requires `Authorization: Bearer $CRON_SECRET`. pg_cron
// calls it with the secret set via `ALTER DATABASE ... SET app.cron_secret = ...`.

import { createClient } from "jsr:@supabase/supabase-js@2";

const IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const IMS_SCOPE =
  "openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_pc.dma_tartan";

// Refresh tokens that expire within this window.
const REFRESH_LEAD_MINUTES = 60;

type Integration = {
  id: string;
  client_id: string;
  client_id_adobe: string | null;
  adobe_client_secret_plaintext: string | null;
  adobe_access_token_plaintext: string | null;
  access_token_expires_at: string | null;
};

type IMSTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

Deno.serve(async (req) => {
  // Authorization — pg_cron and manual curl both pass this.
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("CRON_SECRET") ?? ""}`;
  if (!Deno.env.get("CRON_SECRET") || authHeader !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const cutoff = new Date(
    Date.now() + REFRESH_LEAD_MINUTES * 60 * 1000,
  ).toISOString();

  // Pick integrations that need refresh. `FOR UPDATE SKIP LOCKED` would be
  // ideal here for concurrent cron ticks, but Supabase client doesn't expose
  // it cleanly — we rely on pg_cron running at a frequency lower than the
  // function duration (10 min > typical 5s round-trip).
  const { data: integrations, error: selectError } = await supabase
    .from("integrations")
    .select(
      "id, client_id, client_id_adobe, adobe_client_secret_plaintext, adobe_access_token_plaintext, access_token_expires_at",
    )
    .not("client_id_adobe", "is", null)
    .not("adobe_client_secret_plaintext", "is", null)
    .or(
      `access_token_expires_at.is.null,access_token_expires_at.lte.${cutoff}`,
    );

  if (selectError) {
    return json({ ok: false, error: selectError.message }, 500);
  }

  const results: Array<{ integration_id: string; ok: boolean; error?: string }> =
    [];

  for (const integration of integrations ?? ([] as Integration[])) {
    try {
      const token = await exchangeForToken(integration);
      await writeTokenBack(supabase, integration.id, token);
      results.push({ integration_id: integration.id, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from("integrations")
        .update({ adobe_refresh_error: message })
        .eq("id", integration.id);
      results.push({ integration_id: integration.id, ok: false, error: message });
    }
  }

  return json({ ok: true, count: results.length, results });
});

async function exchangeForToken(
  integration: Integration,
): Promise<IMSTokenResponse> {
  if (!integration.client_id_adobe || !integration.adobe_client_secret_plaintext) {
    throw new Error("Missing Adobe client_id or client_secret on integration");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: integration.client_id_adobe,
    client_secret: integration.adobe_client_secret_plaintext,
    scope: IMS_SCOPE,
  });

  const response = await fetch(IMS_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`IMS ${response.status}: ${detail.slice(0, 200)}`);
  }

  return (await response.json()) as IMSTokenResponse;
}

async function writeTokenBack(
  supabase: ReturnType<typeof createClient>,
  integrationId: string,
  token: IMSTokenResponse,
) {
  const expiresAt = new Date(
    Date.now() + token.expires_in * 1000,
  ).toISOString();

  const { error } = await supabase
    .from("integrations")
    .update({
      adobe_access_token_plaintext: token.access_token,
      access_token_expires_at: expiresAt,
      adobe_refresh_error: null,
      adobe_last_refreshed_at: new Date().toISOString(),
    })
    .eq("id", integrationId);

  if (error) throw new Error(`DB update failed: ${error.message}`);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
