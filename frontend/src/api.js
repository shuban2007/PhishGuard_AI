const BASE_URL = "http://127.0.0.1:8000";

/**
 * Generic fetch wrapper — returns parsed JSON or throws a descriptive error.
 */
async function apiFetch(path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    // Network failure (backend offline, CORS, etc.)
    throw new Error(
      "Cannot reach the PhishGuard server. Make sure the backend is running on port 8000."
    );
  }

  if (!response.ok) {
    let detail = `Server returned ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) detail = errJson.detail;
    } catch (_) { /* ignore */ }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Scan a plain-text message for scam/phishing signals.
 * @param {string} message
 * @returns {Promise<{risk_score: number, prediction: string, source: string}>}
 */
export const scanMessage = (message) =>
  apiFetch("/scan-message", { message });

/**
 * Scan a URL for phishing/malware signals.
 * Uses Safe Browsing → ML model → rule-based heuristics (all automatic fallbacks).
 * @param {string} url
 * @returns {Promise<{url: string, risk_score: number, prediction: string, reason: string, source: string}>}
 */
export const scanUrl = (url) =>
  apiFetch("/scan-url", { url });
