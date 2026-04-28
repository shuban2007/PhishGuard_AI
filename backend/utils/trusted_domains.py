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

# ── Combined Set (mutable — supports auto-learning) ─────────────────────────
trusted_domains: set[str] = set(top_domains + bank_domains + payment_domains)

# Thread lock for safe concurrent writes during auto-learning
_lock = threading.Lock()


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
        if len(parts) >= 3 and parts[-2] in {"co", "com", "net", "org", "gov", "edu", "ac"}:
            return ".".join(parts[-3:])
        if len(parts) >= 2:
            return ".".join(parts[-2:])
    except Exception:
        pass
    return ""


# ── Smart Trust Check ────────────────────────────────────────────────────────
def is_trusted(url: str) -> bool:
    """
    Check if a URL belongs to a trusted domain.
    Supports exact match AND subdomain match.
    e.g. 'mail.google.com' matches 'google.com'
    """
    domain = get_domain(url)
    if not domain:
        return False

    # Check exact domain match
    if domain in trusted_domains:
        return True

    # Check if domain is a subdomain of any trusted domain
    # e.g. 'in.linkedin.com' ends with '.linkedin.com'
    return any(
        domain.endswith("." + td) for td in trusted_domains
    )


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
