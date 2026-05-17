"""
Trusted Domains Database
========================
Large curated list of legitimate domains used to short-circuit phishing
detection and eliminate false positives on well-known websites.

Includes:
- Top global websites
- Banking / financial institutions
- Payment gateways
- Dynamic auto-learning for newly discovered safe domains

Security: Uses strict registered-domain matching to prevent spoofed
subdomains (e.g. "google.com.evil.com") from bypassing trust checks.
"""

import logging
import threading
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# ── Top Global Domains ───────────────────────────────────────────────────────
top_domains = [
    "google.com", "google.co.in", "youtube.com", "facebook.com",
    "instagram.com", "whatsapp.com", "twitter.com", "x.com",
    "linkedin.com", "wikipedia.org", "amazon.com", "amazon.in",
    "netflix.com", "microsoft.com", "apple.com", "bing.com",
    "yahoo.com", "reddit.com", "quora.com", "pinterest.com",
    "tiktok.com", "snapchat.com", "zoom.us", "office.com",
    "live.com", "outlook.com", "github.com", "stackoverflow.com",
    "medium.com", "canva.com", "adobe.com", "dropbox.com",
    "spotify.com", "discord.com", "twitch.tv", "paypal.com",
    "ebay.com", "cnn.com", "bbc.com", "nytimes.com",
    "forbes.com", "imdb.com", "flipkart.com", "myntra.com",
    "ajio.com", "zomato.com", "swiggy.com", "ola.com",
    "uber.com", "booking.com", "airbnb.com", "expedia.com",
    "coursera.org", "udemy.com", "byjus.com", "khanacademy.org",
    "duolingo.com", "telegram.org", "signal.org", "skype.com",
    "slack.com", "notion.so", "figma.com", "behance.net",
    "dribbble.com", "weebly.com", "wix.com",
    # Additional major domains
    "gmail.com", "googlemail.com", "duckduckgo.com",
    "azure.com", "microsoftonline.com", "windows.com",
    "icloud.com", "vimeo.com", "youtu.be",
    "gitlab.com", "npmjs.com", "pypi.org",
    "heroku.com", "vercel.com", "netlify.com",
    "cloudflare.com", "digitalocean.com",
    "reuters.com", "theguardian.com",
    "irctc.co.in", "incometax.gov.in", "gov.in", "nic.in",
    "walmart.com", "target.com", "bestbuy.com",
    "hulu.com", "disneyplus.com", "primevideo.com",
    "twitch.tv", "soundcloud.com", "pandora.com",
    "yelp.com", "tripadvisor.com", "zillow.com",
    "craigslist.org", "tumblr.com", "flickr.com",
    "archive.org", "wordpress.com", "blogger.com",
    "shopify.com", "etsy.com", "alibaba.com",
    "aliexpress.com", "wish.com",
]

# ── Banking Domains ──────────────────────────────────────────────────────────
bank_domains = [
    "hdfcbank.com", "icicibank.com", "sbi.co.in", "axisbank.com",
    "kotak.com", "yesbank.in", "bankofbaroda.in", "unionbankofindia.co.in",
    "pnbindia.in", "indusind.com", "federalbank.co.in", "idfcfirstbank.com",
    "rblbank.com", "bandhanbank.com", "standardchartered.com",
    "hsbc.com", "citibank.com", "bankofamerica.com",
    "chase.com", "wellsfargo.com",
    # Additional global banks
    "barclays.com", "deutschebank.com", "ubs.com",
    "goldmansachs.com", "morganstanley.com",
    "capitalone.com", "americanexpress.com",
]

# ── Payment / Fintech Domains ────────────────────────────────────────────────
payment_domains = [
    "paypal.com", "paytm.com", "phonepe.com", "googlepay.com",
    "razorpay.com", "stripe.com", "squareup.com", "cash.app",
    "venmo.com", "wise.com", "skrill.com", "payoneer.com",
    "amazonpay.in", "bharatpe.com", "mobikwik.com",
    "freecharge.in", "airtel.in", "payu.in",
    "worldpay.com", "adyen.com",
]

# ── Deployment / Hosting Platform Domains ────────────────────────────────────
platform_domains = [
    "netlify.app", "netlify.com",
    "vercel.app", "vercel.com",
    "railway.app",
    "render.com", "onrender.com",
    "herokuapp.com",
    "pages.dev",            # Cloudflare Pages
    "fly.dev",              # Fly.io
    "surge.sh",
    "github.io",
    # PhishGuard AI's own deployed domains
    "phishguardai-byslixcrew.netlify.app",
]

# ── Combined Set (mutable — supports auto-learning) ─────────────────────────
trusted_domains: set[str] = set(
    top_domains + bank_domains + payment_domains + platform_domains
)

# Thread lock for safe concurrent writes during auto-learning
_lock = threading.Lock()

# ── Country-code second-level domains (used for registered domain extraction)
_CC_SLDS = {"co", "com", "net", "org", "gov", "edu", "ac"}


# ── Domain Extraction ────────────────────────────────────────────────────────
def get_domain(url: str) -> str:
    """
    Extract the hostname from a URL, lowercased.
    Returns empty string on parse failure.
    """
    try:
        host = urlparse(url).hostname
        return host.lower() if host else ""
    except Exception:
        return ""


def get_registered_domain(url: str) -> str:
    """
    Extract the registered domain (e.g. 'in.linkedin.com' → 'linkedin.com').
    Handles country-code second-level domains like co.in, co.uk.
    Returns empty string on parse failure.
    """
    try:
        host = get_domain(url)
        parts = host.split(".")
        # Handle ccSLDs: co.in, com.au, org.uk, etc.
        if len(parts) >= 3 and parts[-2] in _CC_SLDS:
            return ".".join(parts[-3:])
        if len(parts) >= 2:
            return ".".join(parts[-2:])
    except Exception:
        pass
    return ""


def _get_registered_domain_from_host(host: str) -> str:
    """
    Same as get_registered_domain but takes a hostname directly.
    Used internally to avoid redundant parsing.
    """
    parts = host.split(".")
    if len(parts) >= 3 and parts[-2] in _CC_SLDS:
        return ".".join(parts[-3:])
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


# ── Strict Trust Check ──────────────────────────────────────────────────────
def is_trusted(url: str) -> bool:
    """
    Check if a URL belongs to a trusted domain using STRICT matching.

    Strategy:
      1. Extract the full hostname
      2. Compute its registered domain (e.g. 'mail.google.com' → 'google.com')
      3. Check if the registered domain is in trusted_domains
      4. Also check exact hostname match for platform subdomains
         (e.g. 'phishguardai-byslixcrew.netlify.app' is an exact entry)

    This prevents spoofed domains like 'google.com.evil.com' from matching,
    because its registered domain is 'evil.com' — not 'google.com'.
    """
    domain = get_domain(url)
    if not domain:
        return False

    # 1. Exact hostname match (handles full subdomain entries like
    #    'phishguardai-byslixcrew.netlify.app')
    if domain in trusted_domains:
        return True

    # 2. Registered domain match (handles 'mail.google.com' → 'google.com')
    registered = _get_registered_domain_from_host(domain)
    if registered and registered in trusted_domains:
        return True

    # 3. For platform domains that act as TLDs (e.g. netlify.app, vercel.app),
    #    any subdomain of them is valid (e.g. 'mysite.netlify.app')
    #    But ONLY if the platform parent is trusted.
    _PLATFORM_PARENTS = {
        "netlify.app", "vercel.app", "railway.app", "onrender.com",
        "herokuapp.com", "pages.dev", "fly.dev", "surge.sh", "github.io",
    }
    for parent in _PLATFORM_PARENTS:
        if domain.endswith("." + parent) and parent in trusted_domains:
            return True

    return False


# ── Spoof Detection ─────────────────────────────────────────────────────────
def is_spoofed_domain(url: str) -> tuple[bool, str]:
    """
    Detect domains that impersonate a trusted service.

    Examples of spoofed domains:
      - 'google.com.evil.com'       → registered domain is 'evil.com', not google.com
      - 'paypal-secure.phish.com'   → contains 'paypal' but isn't paypal.com
      - 'phishguardai.netlify.app.fake.com' → impersonates the real app

    Returns:
        (is_spoofed: bool, impersonated_domain: str)
    """
    domain = get_domain(url)
    if not domain:
        return False, ""

    registered = _get_registered_domain_from_host(domain)

    # Skip if this domain IS actually trusted
    if is_trusted(url):
        return False, ""

    # Check if any trusted domain name appears as a substring in the hostname
    # but the registered domain does NOT match → likely impersonation
    for td in trusted_domains:
        td_base = td.split(".")[0]  # e.g. 'google' from 'google.com'
        if len(td_base) < 4:
            continue  # skip very short names ('x', 'com') to avoid false triggers

        if td_base in domain and registered != td:
            # The hostname contains a trusted brand but isn't actually that domain
            logger.warning(
                "🎭 Spoof detected: %s impersonates %s (registered: %s)",
                domain, td, registered,
            )
            return True, td

    return False, ""


# ── Auto Domain Expansion (Dynamic Learning) ────────────────────────────────
# Track how many times a domain is classified safe for conservative expansion
_domain_safe_counts: dict[str, int] = {}
SAFE_THRESHOLD = 3  # require N consecutive safe classifications before auto-trusting


def learn_trusted_domain(url: str, risk_score: int) -> None:
    """
    Auto-learn new safe domains dynamically.
    If a domain is repeatedly classified as safe (risk_score < 20),
    it gets auto-added to the trusted set.
    
    Uses a counter threshold to avoid adding domains after a single scan.
    """
    domain = get_registered_domain(url)
    if not domain or domain in trusted_domains:
        return

    with _lock:
        if risk_score < 20:
            _domain_safe_counts[domain] = _domain_safe_counts.get(domain, 0) + 1
            if _domain_safe_counts[domain] >= SAFE_THRESHOLD:
                trusted_domains.add(domain)
                logger.info(
                    "🧠 Auto-learned trusted domain: %s (after %d safe scans)",
                    domain, SAFE_THRESHOLD,
                )
                del _domain_safe_counts[domain]
        else:
            # Reset counter if domain gets a high risk score
            _domain_safe_counts.pop(domain, None)


def get_trusted_domain_count() -> int:
    """Return the current number of trusted domains (including learned ones)."""
    return len(trusted_domains)
