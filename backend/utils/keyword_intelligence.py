"""
Keyword Intelligence Engine — PhishGuard AI
=============================================
Smart, structured keyword scoring system that works alongside the ML model
to improve SMS/message detection accuracy and reduce false positives.

Design principles:
  • Weighted scoring (not binary matching)
  • Separate SCAM vs SAFE signal channels
  • Context-aware combination boosters
  • Aggressive false-positive suppression
  • Explainable output with human-readable reasons
  • Zero external dependencies — pure Python, fast execution
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

# ─────────────────────────────────────────────────────────────────────────────
# SCAM KEYWORD CATEGORIES (positive weights → increase risk)
# ─────────────────────────────────────────────────────────────────────────────
SCAM_KEYWORDS: dict[str, int] = {
    # Urgency / Pressure
    "urgent": 20,
    "immediately": 20,
    "action required": 25,
    "act now": 25,
    "expire": 15,
    "hurry": 15,
    "limited time": 20,
    "asap": 15,
    "right away": 15,
    "don't delay": 15,
    "final notice": 25,
    "last chance": 20,
    # Security / Account Takeover
    "verify your": 22,
    "verify": 20,
    "login": 20,
    "suspended": 25,
    "blocked": 25,
    "otp": 15,
    "password": 15,
    "confirm your": 20,
    "update your account": 22,
    "unauthorized": 20,
    "security alert": 25,
    "unusual activity": 25,
    "locked": 20,
    "compromised": 25,
    "breach": 20,
    "reset your": 15,
    # Financial Bait
    "bank": 10,
    "account": 10,
    "credit card": 20,
    "debit card": 20,
    "send money": 25,
    "wire transfer": 25,
    "routing number": 25,
    "pay now": 20,
    "payment": 10,
    "bitcoin": 15,
    "crypto": 15,
    "gift card": 20,
    "western union": 25,
    "moneygram": 25,
    "zelle": 10,
    "venmo": 10,
    # Links / URLs
    "click here": 25,
    "link": 10,
    "http": 20,
    "bit.ly": 30,
    "tinyurl": 30,
    "goo.gl": 30,
    "t.co": 20,
    # Reward / Prize Traps
    "win": 25,
    "winner": 25,
    "prize": 25,
    "lottery": 30,
    "gift": 20,
    "free": 15,
    "claim now": 25,
    "claim your": 25,
    "congratulations": 25,
    "reward": 20,
    "cash": 15,
    "bonus": 15,
    "selected": 10,
    "lucky": 20,
    "you have been chosen": 25,
    # Threat / Intimidation
    "legal action": 25,
    "penalty": 20,
    "arrest": 25,
    "warrant": 25,
    "police": 15,
    "court": 15,
    "sue": 15,
    "terminate": 15,
    "will be closed": 20,
    "permanently disabled": 25,
    "seized": 20,
}

# ─────────────────────────────────────────────────────────────────────────────
# SAFE KEYWORD CATEGORIES (negative weights → decrease risk)
# ─────────────────────────────────────────────────────────────────────────────
SAFE_KEYWORDS: dict[str, int] = {
    # Professional / Conversational
    "meeting": -10,
    "schedule": -10,
    "tomorrow": -5,
    "thank you": -10,
    "thanks": -8,
    "regards": -10,
    "best regards": -12,
    "kind regards": -12,
    "sincerely": -10,
    "team": -5,
    "cheers": -8,
    "looking forward": -8,
    "let me know": -8,
    "hope you're": -8,
    "how are you": -10,
    "good morning": -8,
    "good evening": -8,
    # Transactional (legitimate)
    "subscription": -5,
    "renewed": -5,
    "successfully": -10,
    "no action required": -15,
    "no action needed": -15,
    "receipt": -5,
    "invoice": -5,
    "order confirmed": -10,
    "delivery": -5,
    "shipped": -5,
    "tracking": -5,
    # Service / Informational
    "reminder": -5,
    "scheduled": -5,
    "appointment": -8,
    "confirmed": -5,
    "welcome": -5,
    "hi ": -3,
    "hello ": -3,
    "hey ": -3,
}

# ─────────────────────────────────────────────────────────────────────────────
# Compiled URL pattern (reusable, no overhead per call)
# ─────────────────────────────────────────────────────────────────────────────
_URL_RE = re.compile(
    r'(?:https?://|www\.|bit\.ly|tinyurl|goo\.gl|t\.co|is\.gd|buff\.ly|ow\.ly|short\.link)\S+',
    re.IGNORECASE,
)


# ─────────────────────────────────────────────────────────────────────────────
# Data class for structured result
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class KeywordIntelResult:
    """Structured output from the keyword intelligence engine."""
    keyword_score: int = 0
    reasons: list[str] = field(default_factory=list)
    scam_signals: list[str] = field(default_factory=list)
    safe_signals: list[str] = field(default_factory=list)
    context_boosts: list[str] = field(default_factory=list)
    has_link: bool = False
    false_positive_reductions: list[str] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# CORE: Weighted keyword scoring
# ─────────────────────────────────────────────────────────────────────────────
def _scan_keywords(text: str) -> tuple[int, list[str], list[str], list[str]]:
    """
    Scan text against SCAM and SAFE dictionaries.
    Returns (raw_score, reasons, scam_signals, safe_signals).
    """
    score = 0
    reasons: list[str] = []
    scam_signals: list[str] = []
    safe_signals: list[str] = []

    for word, weight in SCAM_KEYWORDS.items():
        if word in text:
            score += weight
            scam_signals.append(word)
            reasons.append(f"⚠ Suspicious keyword: \"{word}\" (+{weight})")

    for word, weight in SAFE_KEYWORDS.items():
        if word in text:
            score += weight  # weight is already negative
            safe_signals.append(word)
            reasons.append(f"✓ Safe indicator: \"{word}\" ({weight})")

    return score, reasons, scam_signals, safe_signals


# ─────────────────────────────────────────────────────────────────────────────
# CONTEXT-AWARE BOOSTING — compound pattern detection
# ─────────────────────────────────────────────────────────────────────────────
def _context_boost(text: str, scam_signals: list[str], has_link: bool) -> tuple[int, list[str]]:
    """
    Detect dangerous signal *combinations* that individually might be benign
    but together form strong scam patterns.
    """
    boost = 0
    boosts: list[str] = []

    # Urgency words set
    urgency_words = {"urgent", "immediately", "action required", "act now",
                     "hurry", "asap", "right away", "final notice", "last chance",
                     "don't delay", "limited time", "expire"}
    has_urgency = bool(urgency_words & set(scam_signals))

    # Reward words set
    reward_words = {"win", "winner", "prize", "lottery", "gift", "free",
                    "claim now", "claim your", "congratulations", "reward",
                    "cash", "bonus", "lucky", "you have been chosen", "selected"}
    has_reward = bool(reward_words & set(scam_signals))

    # Financial words set
    financial_words = {"bank", "account", "credit card", "debit card",
                       "send money", "wire transfer", "routing number",
                       "pay now", "payment", "bitcoin", "crypto", "gift card",
                       "western union", "moneygram", "zelle", "venmo"}
    has_financial = bool(financial_words & set(scam_signals))

    # Security words set
    security_words = {"verify", "verify your", "login", "suspended", "blocked",
                      "otp", "password", "confirm your", "unauthorized",
                      "security alert", "unusual activity", "locked",
                      "compromised", "breach", "reset your",
                      "update your account"}
    has_security = bool(security_words & set(scam_signals))

    # Threat words set
    threat_words = {"legal action", "penalty", "arrest", "warrant", "police",
                    "court", "sue", "terminate", "will be closed",
                    "permanently disabled", "seized"}
    has_threat = bool(threat_words & set(scam_signals))

    # ── Compound patterns ────────────────────────────────────────────────
    if has_link and has_urgency:
        boost += 20
        boosts.append("🔗 Link + urgency — high-risk combination (+20)")

    if has_reward and has_link:
        boost += 25
        boosts.append("🎁 Reward bait + link — classic scam pattern (+25)")

    if has_financial and (has_urgency or has_threat):
        boost += 20
        boosts.append("💰 Financial request + pressure — high-risk pattern (+20)")

    if has_security and has_link:
        boost += 15
        boosts.append("🔐 Security alert + link — phishing pattern (+15)")

    if has_threat and has_link:
        boost += 20
        boosts.append("⚖ Threat language + link — extortion pattern (+20)")

    if has_reward and has_urgency:
        boost += 15
        boosts.append("🎯 Reward + urgency — pressure-bait combo (+15)")

    # Multiple threat categories stacking
    active_categories = sum([has_urgency, has_reward, has_financial,
                             has_security, has_threat])
    if active_categories >= 3:
        boost += 15
        boosts.append(f"🚨 {active_categories} threat categories active — compound risk (+15)")

    return boost, boosts


# ─────────────────────────────────────────────────────────────────────────────
# FALSE POSITIVE REDUCTION — suppress innocent messages
# ─────────────────────────────────────────────────────────────────────────────
def _reduce_false_positives(
    text: str,
    score: int,
    safe_signals: list[str],
    scam_signals: list[str],
    has_link: bool,
) -> tuple[int, list[str]]:
    """
    Apply intelligent score reductions for messages that exhibit safe
    characteristics. This prevents normal emails/texts from being flagged.
    """
    reduction = 0
    fp_reasons: list[str] = []

    # ── Strong safe indicators without links ─────────────────────────────
    strong_safe = {"no action required", "no action needed", "successfully",
                   "order confirmed"}
    found_strong = strong_safe & set(safe_signals)
    if found_strong and not has_link:
        reduction -= 20
        fp_reasons.append(f"Strong safe signal: {', '.join(found_strong)} (−20)")

    # ── Conversational tone without scam indicators ──────────────────────
    conversational = {"thank you", "thanks", "regards", "best regards",
                      "kind regards", "sincerely", "cheers",
                      "looking forward", "let me know", "hope you're",
                      "how are you", "good morning", "good evening",
                      "hi ", "hello ", "hey "}
    conv_hits = conversational & set(safe_signals)
    if len(conv_hits) >= 2 and not has_link and len(scam_signals) <= 1:
        reduction -= 15
        fp_reasons.append("Conversational tone detected — reduced risk (−15)")

    # ── Short casual messages (unlikely scams) ───────────────────────────
    word_count = len(text.split())
    if word_count <= 5 and len(scam_signals) == 0:
        reduction -= 10
        fp_reasons.append("Very short message with no scam signals (−10)")
    elif word_count <= 10 and len(scam_signals) == 0 and len(conv_hits) >= 1:
        reduction -= 8
        fp_reasons.append("Short conversational message (−8)")

    # ── No links + neutral tone ──────────────────────────────────────────
    if not has_link and len(scam_signals) <= 1 and len(safe_signals) >= 2:
        reduction -= 10
        fp_reasons.append("No suspicious links + multiple safe indicators (−10)")

    # ── Legitimate transactional patterns ────────────────────────────────
    transactional_safe = {"receipt", "invoice", "order confirmed",
                          "delivery", "shipped", "tracking",
                          "subscription", "renewed"}
    trans_hits = transactional_safe & set(safe_signals)
    if len(trans_hits) >= 2 and not has_link:
        reduction -= 10
        fp_reasons.append("Legitimate transactional pattern (−10)")

    return reduction, fp_reasons


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API: Full keyword intelligence analysis
# ─────────────────────────────────────────────────────────────────────────────
def keyword_intelligence(text: str) -> KeywordIntelResult:
    """
    Run the complete keyword intelligence pipeline on a message.

    Returns a KeywordIntelResult with:
      - keyword_score: weighted score contribution (can be negative)
      - reasons: full list of human-readable explanations
      - scam_signals / safe_signals: matched keywords
      - context_boosts: compound pattern explanations
      - has_link: whether URLs/links were detected
      - false_positive_reductions: FP suppression explanations
    """
    text_lower = text.lower()
    result = KeywordIntelResult()

    # ── Step 1: Link detection ───────────────────────────────────────────
    result.has_link = bool(_URL_RE.search(text))

    # ── Step 2: Weighted keyword scoring ─────────────────────────────────
    base_score, base_reasons, scam_sigs, safe_sigs = _scan_keywords(text_lower)
    result.scam_signals = scam_sigs
    result.safe_signals = safe_sigs
    result.reasons.extend(base_reasons)

    # ── Step 3: Context-aware combination boosting ───────────────────────
    ctx_boost, ctx_reasons = _context_boost(text_lower, scam_sigs, result.has_link)
    result.context_boosts = ctx_reasons
    result.reasons.extend(ctx_reasons)

    # ── Step 4: False positive reduction ─────────────────────────────────
    fp_reduction, fp_reasons = _reduce_false_positives(
        text_lower, base_score + ctx_boost, safe_sigs, scam_sigs, result.has_link,
    )
    result.false_positive_reductions = fp_reasons
    result.reasons.extend(fp_reasons)

    # ── Combine all scoring layers ───────────────────────────────────────
    result.keyword_score = base_score + ctx_boost + fp_reduction

    return result


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API: Combine keyword intelligence with ML model output
# ─────────────────────────────────────────────────────────────────────────────
def compute_final_score(
    ml_probability: float | None,
    keyword_result: KeywordIntelResult,
) -> tuple[int, str, list[str]]:
    """
    Blend ML model output with keyword intelligence scoring.

    Args:
        ml_probability: Model's scam probability (0.0–1.0), or None if unavailable.
        keyword_result: Output from keyword_intelligence().

    Returns:
        (final_score, prediction_label, consolidated_reasons)
    """
    # ── ML baseline ──────────────────────────────────────────────────────
    if ml_probability is not None:
        ml_score = int(ml_probability * 100)
    else:
        ml_score = 15  # conservative baseline when ML is unavailable

    # ── Blend: ML + keyword intelligence ─────────────────────────────────
    final_score = ml_score + keyword_result.keyword_score

    # ── Link presence without ML signal → add a small bump ───────────────
    if keyword_result.has_link and ml_score < 30:
        final_score += 10

    # ── Clamp to 0–100 ───────────────────────────────────────────────────
    final_score = max(0, min(100, final_score))

    # ── Classification ───────────────────────────────────────────────────
    if final_score >= 71:
        prediction = "SCAM"
    elif final_score >= 41:
        prediction = "SUSPICIOUS"
    else:
        prediction = "SAFE"

    # ── Build consolidated reasons ───────────────────────────────────────
    reasons = list(keyword_result.reasons)

    # Add summary-level link status
    if keyword_result.has_link:
        reasons.append("📎 Suspicious link/URL detected in message")
    else:
        reasons.append("✓ No suspicious links detected")

    # Default reason for clean messages
    if final_score < 20 and not keyword_result.scam_signals:
        reasons.append("✓ Message appears safe — no scam patterns found")

    return final_score, prediction, reasons
