/**
 * App Store availability — Reveal the download CTA only after Apple exposes the app publicly.
 *
 * CALLING SPEC:
 *   Loaded with `defer` on the landing page.
 *   Inputs: Apple Search API responses for a small storefront list.
 *   Outputs: Updates #app-store-link and #availability-status.
 *   Side effects: Read-only network requests and DOM text/visibility updates.
 */

const APPLE_ID = "6805341813";
const STOREFRONTS = ["us", "cn", "jp", "gb"];

async function lookupStorefront(country) {
  const endpoint = `https://itunes.apple.com/lookup?id=${APPLE_ID}&country=${country}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.resultCount > 0 ? payload.results[0] : null;
}

async function findPublicListing() {
  const results = await Promise.allSettled(STOREFRONTS.map(lookupStorefront));
  return results.find((result) => result.status === "fulfilled" && result.value)?.value ?? null;
}

async function updateAvailability() {
  const downloadLink = document.querySelector("#app-store-link");
  const status = document.querySelector("#availability-status");
  if (!downloadLink || !status) return;
  try {
    const listing = await findPublicListing();
    if (!listing) return;
    downloadLink.href = listing.trackViewUrl || `https://apps.apple.com/app/id${APPLE_ID}`;
    downloadLink.hidden = false;
    status.hidden = true;
  } catch {
    // Keep the truthful "coming soon" state if Apple is unreachable.
  }
}

updateAvailability();
