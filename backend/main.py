"""
PhishGuard AI — Hybrid Phishing Detection Backend
==================================================
Multi-layered detection system combining:
  1. Google Safe Browsing API (primary intelligence)
  2. Large trusted domain database (false-positive elimination)
  3. ML model (probabilistic scoring)
  4. Rule-based heuristics (keyword / structure boosters)
  5. Auto-learning domain expansion

Fail-safe architecture: always returns a result, never crashes.
"""

import os
import logging
import joblib
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from urllib.parse import urlparse
from dotenv import load_dotenv

from utils.features import extract_features
from utils.safebrowsing import check_safe_browsing
from utils.trusted_domains import (
    is_trusted,
    get_registered_domain,
    get_domain,
    learn_trusted_domain,
    get_trusted_domain_count,
    trusted_domains,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Global model store ──────────────────────────────────────────────────────
models: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models once at startup; release on shutdown."""
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    for name, filename in [
        ("text_model",  "text_model.pkl"),
        ("vectorizer",  "vectorizer.pkl"),
        ("url_model",   "url_model.pkl"),
    ]:
        path = os.path.join(models_dir, filename)
        try:
            models[name] = joblib.load(path)
            logger.info("✅ Loaded model: %s", filename)
        except Exception as e:
            logger.error(
                "⚠️  Could not load %s: %s — service will use rule-based fallback.",
                filename, e,
            )
    logger.info(
        "🚀 PhishGuard AI ready | Models: %d/3 | Trusted domains: %d",
        len(models), get_trusted_domain_count(),
    )
    yield
    models.clear()


app = FastAPI(title="PhishGuard AI Backend", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ───────────────────────────────────────────────
class MessageRequest(BaseModel):
    message: str


class UrlRequest(BaseModel):
    url: str


# ── Heuristic helpers ────────────────────────────────────────────────────────
PHISHING_KEYWORDS = [
    "login", "secure", "verify", "account", "update",
    "password", "signin", "banking", "authenticate", "credential",
]
SCAM_KEYWORDS = [
    "free", "win", "bonus", "offer", "claim",
    "prize", "lucky", "reward", "gift", "congratulation",
]


def rule_based_score(url: str) -> tuple[int, list[str]]:
    """
    Pure heuristic scoring — no ML required.
    Returns (risk_score 0-100, list_of_reasons).
    """
    url_lower = url.lower()
    score = 0
    reasons: list[str] = []

    # ── Suspicious structural patterns ────────────────────────────────────
    if "@" in url_lower:
        score += 30
        reasons.append("@ symbol in URL")
    if url_lower.count("-") > 2:
        score += 15
        reasons.append("excessive hyphens")
    if url_lower.count(".") > 4:
        score += 15
        reasons.append("excessive subdomains")
    if not url_lower.startswith("https://"):
        score += 20
        reasons.append("no HTTPS")

    # ── IP address as host ────────────────────────────────────────────────
    try:
        host = urlparse(url).hostname or ""
        parts = host.split(".")
        if len(parts) == 4 and all(p.isdigit() for p in parts):
            score += 35
            reasons.append("IP address as host")
    except Exception:
        pass

    # ── URL length (very long URLs are suspicious) ────────────────────────
    if len(url) > 100:
        score += 10
        reasons.append("unusually long URL")

    # ── Multiple redirects / encoded characters ───────────────────────────
    if url_lower.count("//") > 1:
        score += 15
        reasons.append("multiple // redirects")
    if "%" in url_lower:
        encoded_count = url_lower.count("%")
        if encoded_count > 3:
            score += 10
            reasons.append("heavy URL encoding")

    score = min(score, 100)
    return score, reasons


def keyword_boost(url: str) -> tuple[int, list[str]]:
    """
    Check URL path (not hostname) for phishing/scam keywords.
    Returns (boosted_minimum_score, list_of_matched_keywords).
    """
    try:
        parsed = urlparse(url)
        url_path = (parsed.path + "?" + (parsed.query or "")).lower()
    except Exception:
        url_path = url.lower()

    boost_score = 0
    matched: list[str] = []

    phish_hits = [w for w in PHISHING_KEYWORDS if w in url_path]
    if phish_hits:
        boost_score = max(boost_score, 85)
        matched.extend(phish_hits)

    scam_hits = [w for w in SCAM_KEYWORDS if w in url_path]
    if scam_hits:
        boost_score = max(boost_score, 75)
        matched.extend(scam_hits)

    return boost_score, matched


def label_from_score(score: int) -> str:
    if score >= 70:
        return "PHISHING"
    if score >= 40:
        return "SUSPICIOUS"
    return "SAFE"


# ── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "running",
        "version": "2.0.0",
        "models_loaded": {
            "text_model": "text_model" in models,
            "vectorizer":  "vectorizer"  in models,
            "url_model":   "url_model"   in models,
        },
        "trusted_domains_count": get_trusted_domain_count(),
    }


@app.post("/scan-message")
def scan_message(request: MessageRequest):
    msg = request.message.strip()
    if not msg:
        return JSONResponse(status_code=400, content={"detail": "Message cannot be empty"})

    # ── Layer 1: ML model ─────────────────────────────────────────────────
    if "text_model" in models and "vectorizer" in models:
        try:
            vec      = models["vectorizer"].transform([msg.lower()])
            prob_arr = models["text_model"].predict_proba(vec)[0]
            risk_score = int((prob_arr[1] if len(prob_arr) > 1 else prob_arr[0]) * 100)
            prediction = "SCAM" if risk_score >= 50 else "SAFE"
            return {"risk_score": risk_score, "prediction": prediction, "source": "ml"}
        except Exception as e:
            logger.error("Text ML error: %s", e)

    # ── Layer 2: Keyword fallback ─────────────────────────────────────────
    msg_lower  = msg.lower()
    scam_hits  = [w for w in ["free", "win", "bonus", "prize", "click", "reward", "urgent", "verify"] if w in msg_lower]
    risk_score = min(len(scam_hits) * 20, 95) if scam_hits else 10
    prediction = "SCAM" if risk_score >= 50 else "SAFE"
    return {"risk_score": risk_score, "prediction": prediction, "source": "rule-based"}


@app.post("/scan-url")
async def scan_url(request: UrlRequest):
    """
    Hybrid phishing detection with 7-step fail-safe pipeline:

    STEP 1: Google Safe Browsing API (primary check)
    STEP 2: Trusted domain database (false-positive elimination)
    STEP 3: ML model prediction
    STEP 4: Rule-based heuristic boosting
    STEP 5: Auto-learn safe domains
    STEP 6: Final classification
    STEP 7: Fallback handling (never crash)
    """
    url = request.url.strip()
    if not url:
        return JSONResponse(status_code=400, content={"detail": "URL cannot be empty"})

    # Ensure URL has a scheme for proper parsing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    detection_layers: list[str] = []
    reasons: list[str] = []

    try:
        # ══════════════════════════════════════════════════════════════════
        # STEP 1: Google Safe Browsing API (primary intelligence)
        # ══════════════════════════════════════════════════════════════════
        is_malicious = None
        try:
            is_malicious = await check_safe_browsing(url)
        except Exception as e:
            logger.error("Safe Browsing wrapper error: %s", e)
            is_malicious = None

        if is_malicious is True:
            logger.warning("🚨 Safe Browsing flagged: %s", url)
            return {
                "url":        url,
                "risk_score": 95,
                "prediction": "PHISHING",
                "reason":     "Flagged by Google Safe Browsing as malicious",
                "source":     "safe-browsing",
            }

        if is_malicious is None:
            detection_layers.append("safe-browsing-unavailable")
            logger.warning("Safe Browsing unavailable — continuing with ML/rule fallback.")
        else:
            detection_layers.append("safe-browsing-clean")

        # ══════════════════════════════════════════════════════════════════
        # STEP 2: Trusted domain database (eliminate false positives)
        # ══════════════════════════════════════════════════════════════════
        if is_trusted(url):
            reg = get_registered_domain(url)
            logger.info("✅ Trusted domain short-circuit: %s", reg)

            sb_note = ""
            if "safe-browsing-clean" in detection_layers:
                sb_note = " + Safe Browsing verified"
            elif "safe-browsing-unavailable" in detection_layers:
                sb_note = " (Safe Browsing offline)"

            return {
                "url":        url,
                "risk_score": 0,
                "prediction": "SAFE",
                "reason":     f"Trusted domain ({reg}){sb_note}",
                "source":     "trusted-domain",
            }

        # ══════════════════════════════════════════════════════════════════
        # STEP 3: ML model prediction
        # ══════════════════════════════════════════════════════════════════
        ml_score: int | None = None
        if "url_model" in models:
            try:
                features = extract_features(url)
                proba    = models["url_model"].predict_proba([features])[0]
                ml_score = int((proba[1] if len(proba) > 1 else proba[0]) * 100)
                detection_layers.append("ml")
                logger.info("ML score for %s → %d", url, ml_score)
            except Exception as e:
                logger.error("URL ML error: %s", e)
        else:
            logger.warning("url_model not loaded — skipping ML layer.")

        # ══════════════════════════════════════════════════════════════════
        # STEP 4: Rule-based heuristic scoring
        # ══════════════════════════════════════════════════════════════════
        rule_score, rule_reasons = rule_based_score(url)
        detection_layers.append("rules")
        reasons.extend(rule_reasons)

        # ── Combine ML + rule scores ──────────────────────────────────────
        if ml_score is not None:
            # Weighted blend: 60% ML, 40% rules
            risk_score = int(ml_score * 0.6 + rule_score * 0.4)
        else:
            # No ML → rely purely on rules
            risk_score = rule_score

        # ── Keyword boosters (path-only to avoid false positives) ─────────
        boost_min, keyword_hits = keyword_boost(url)
        if keyword_hits:
            risk_score = max(risk_score, boost_min)
            reasons.append(f"suspicious keywords: {', '.join(keyword_hits)}")

        risk_score = min(risk_score, 100)

        # ══════════════════════════════════════════════════════════════════
        # STEP 5: Auto-learn safe domains (dynamic expansion)
        # ══════════════════════════════════════════════════════════════════
        learn_trusted_domain(url, risk_score)

        # ══════════════════════════════════════════════════════════════════
        # STEP 6: Final classification
        # ══════════════════════════════════════════════════════════════════
        prediction = label_from_score(risk_score)

        # Build human-readable reason
        if ml_score is not None:
            reason_text = f"ML (score={ml_score}) + heuristic analysis"
        else:
            reason_text = "Heuristic analysis (ML unavailable)"

        if reasons:
            reason_text += f" | Detected: {', '.join(reasons)}"

        # Annotate with Safe Browsing status
        if "safe-browsing-unavailable" in detection_layers:
            reason_text += " | ⚠️ Safe Browsing offline"
        elif "safe-browsing-clean" in detection_layers:
            reason_text += " | Safe Browsing: clean"

        return {
            "url":        url,
            "risk_score": risk_score,
            "prediction": prediction,
            "reason":     reason_text,
            "source":     "+".join(detection_layers),
        }

    except Exception as e:
        # ══════════════════════════════════════════════════════════════════
        # STEP 7: Ultimate fail-safe — NEVER crash, ALWAYS return a result
        # ══════════════════════════════════════════════════════════════════
        logger.exception("🔥 Unexpected error scanning %s: %s", url, e)
        return {
            "url":        url,
            "risk_score": 50,
            "prediction": "SUSPICIOUS",
            "reason":     "Analysis encountered an error — flagged as suspicious for safety",
            "source":     "failsafe",
        }
