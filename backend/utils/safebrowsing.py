import httpx
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("SAFE_BROWSING_API_KEY", "").strip()

async def check_safe_browsing(url: str) -> bool | None:
    """
    Check a URL against Google Safe Browsing API.

    Returns:
        True  → URL is flagged as malicious
        False → URL is clean according to Safe Browsing
        None  → API unavailable / key missing / request failed (caller should fallback)
    """
    if not API_KEY:
        logger.warning("SAFE_BROWSING_API_KEY is not set — skipping Safe Browsing check.")
        return None

    endpoint = (
        f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"
    )

    payload = {
        "client": {
            "clientId": "phishguard-ai",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(endpoint, json=payload)

        # 200 → valid response
        if response.status_code == 200:
            data = response.json()
            return "matches" in data and len(data.get("matches", [])) > 0

        # 400 → bad request (likely malformed URL or bad key format)
        if response.status_code == 400:
            logger.warning(
                "Safe Browsing API returned 400 Bad Request for URL=%s | body=%s",
                url, response.text[:300]
            )
            return None

        # 403 → invalid or missing API key
        if response.status_code == 403:
            logger.error(
                "Safe Browsing API returned 403 Forbidden — check your API key. body=%s",
                response.text[:300]
            )
            return None

        # 429 → rate limited
        if response.status_code == 429:
            logger.warning("Safe Browsing API rate limit hit — falling back to ML.")
            return None

        # Any other server-side error (5xx, etc.)
        logger.warning(
            "Safe Browsing API unexpected status=%s | body=%s",
            response.status_code, response.text[:300]
        )
        return None

    except httpx.TimeoutException:
        logger.warning("Safe Browsing API timed out for URL=%s — falling back to ML.", url)
        return None

    except httpx.ConnectError:
        logger.warning("Safe Browsing API connection failed — no internet or DNS issue.")
        return None

    except Exception as e:
        logger.error("Safe Browsing API unexpected error: %s", e)
        return None
