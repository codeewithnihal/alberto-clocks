import { safeStorage } from "../lib/storage";

/**
 * INTEGRATION BOUNDARY for everything that would normally hit a backend
 * (contact form, newsletter, checkout order request).
 *
 * - Set VITE_FORM_ENDPOINT (in .env) to an HTTPS endpoint that accepts
 *   POST { kind, payload, at } as JSON and the data is really delivered.
 * - Without it nothing leaves the browser: the record is kept in localStorage
 *   ("alberto.outbox.v1") and the UI says so honestly (delivered: false).
 */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;
const OUTBOX = "alberto.outbox.v1";

export async function submitForm(kind, payload) {
  const record = { kind, payload, at: new Date().toISOString() };

  if (ENDPOINT) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error(`Submission failed (HTTP ${response.status}).`);
    return { delivered: true };
  }

  const outbox = safeStorage.get(OUTBOX, []);
  safeStorage.set(OUTBOX, [...(Array.isArray(outbox) ? outbox : []), record].slice(-50));
  return { delivered: false };
}

export const NOT_CONNECTED =
  "No mail or order service is connected yet, so this was saved on this device only and has not been sent.";
