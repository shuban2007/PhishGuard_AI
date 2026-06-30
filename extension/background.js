/**
 * SlixBlock Background Service Worker
 * ====================================
 * Uses built-in heuristic analysis for phishing detection.
 * No local backend required — works fully offline.
 * 
 * Mirrors the detection logic of the PhishGuard AI backend:
 *   1. Trusted domain database (false-positive elimination)
 *   2. Rule-based heuristic scoring (keyword / structure analysis)
 *   3. Final classification
 */

// ── Trusted Domains Database ────────────────────────────────────────────────
const TRUSTED_DOMAINS = new Set([
  // Search & Web
  "google.com", "google.co.in", "google.co.uk", "google.co.jp", "google.de",
  "google.fr", "google.es", "google.it", "google.ca", "google.com.au",
  "bing.com", "duckduckgo.com", "yahoo.com", "baidu.com", "yandex.ru",
  
  // Social Media
  "facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com",
  "reddit.com", "tiktok.com", "pinterest.com", "snapchat.com", "tumblr.com",
  "threads.net", "mastodon.social", "discord.com", "discord.gg",
  
  // Video & Streaming
  "youtube.com", "youtu.be", "netflix.com", "twitch.tv", "vimeo.com",
  "disneyplus.com", "hulu.com", "primevideo.com", "spotify.com",
  "soundcloud.com", "hbomax.com", "peacocktv.com",
  
  // Tech & Dev
  "github.com", "gitlab.com", "bitbucket.org", "stackoverflow.com",
  "stackexchange.com", "npmjs.com", "pypi.org", "docker.com",
  "vercel.com", "netlify.com", "heroku.com", "railway.app",
  "codepen.io", "jsfiddle.net", "replit.com", "glitch.com",
  
  // Microsoft
  "microsoft.com", "live.com", "outlook.com", "office.com",
  "office365.com", "azure.com", "visualstudio.com", "xbox.com",
  "skype.com", "bing.com", "msn.com", "onedrive.com",
  
  // Apple
  "apple.com", "icloud.com", "itunes.com",
  
  // Amazon & E-commerce
  "amazon.com", "amazon.co.uk", "amazon.de", "amazon.in",
  "ebay.com", "etsy.com", "shopify.com", "walmart.com",
  "target.com", "bestbuy.com", "alibaba.com", "aliexpress.com",
  
  // Communication
  "whatsapp.com", "telegram.org", "signal.org", "slack.com",
  "zoom.us", "meet.google.com", "teams.microsoft.com",
  
  // Finance (top banks/services)
  "paypal.com", "stripe.com", "wise.com", "revolut.com",
  "chase.com", "bankofamerica.com", "wellsfargo.com",
  
  // Cloud & Productivity
  "dropbox.com", "notion.so", "trello.com", "asana.com",
  "figma.com", "canva.com", "adobe.com", "atlassian.com",
  
  // News & Media
  "bbc.com", "bbc.co.uk", "cnn.com", "nytimes.com", "reuters.com",
  "theguardian.com", "washingtonpost.com", "forbes.com", "bloomberg.com",
  
  // Education
  "wikipedia.org", "wikimedia.org", "khanacademy.org", "coursera.org",
  "edx.org", "udemy.com", "medium.com", "quora.com",
  
  // Security
  "virustotal.com", "malwarebytes.com", "norton.com", "kaspersky.com",
  
  // Government
  "gov", "gov.in", "gov.uk", "gov.au",
  
  // Our own site
  "phishguardai-byslixcrew.netlify.app"
]);

// ── Phishing Keywords ───────────────────────────────────────────────────────
const PHISHING_KEYWORDS = [
  "login", "secure", "verify", "account", "update",
  "password", "signin", "banking", "authenticate", "credential",
];

const SCAM_KEYWORDS = [
  "free", "win", "bonus", "offer", "claim",
  "prize", "lucky", "reward", "gift", "congratulation",
];

const MESSAGE_SCAM_SIGNALS = {
  urgency: [
    "urgent", "immediately", "action required", "act now",
    "expire", "hurry", "limited time", "asap", "right away",
    "don't delay", "final notice", "last chance"
  ],
  security: [
    "verify", "verify your", "login", "suspended", "blocked",
    "otp", "password", "confirm your", "update your account",
    "unauthorized", "security alert", "unusual activity",
    "locked", "compromised", "breach", "reset your"
  ],
  reward: [
    "win", "winner", "prize", "lottery", "gift", "free",
    "claim now", "claim your", "congratulations", "reward",
    "cash", "bonus", "selected", "lucky", "you have been chosen"
  ],
  threat: [
    "legal action", "penalty", "arrest", "warrant", "police",
    "court", "sue", "terminate", "will be closed",
    "permanently disabled", "seized"
  ],
  financial: [
    "bank", "account", "credit card", "debit card",
    "send money", "wire transfer", "routing number",
    "pay now", "payment", "bitcoin", "crypto", "gift card",
    "western union", "moneygram", "zelle", "venmo"
  ]
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function getRegisteredDomain(domain) {
  const parts = domain.split('.');
  if (parts.length <= 2) return domain;
  // Handle co.uk, co.in, etc.
  const ccSlds = ['co', 'com', 'org', 'net', 'ac', 'gov', 'edu'];
  if (parts.length >= 3 && ccSlds.includes(parts[parts.length - 2])) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

function isTrusted(url) {
  const domain = getDomain(url);
  const regDomain = getRegisteredDomain(domain);
  
  // Check exact domain and registered domain
  if (TRUSTED_DOMAINS.has(domain) || TRUSTED_DOMAINS.has(regDomain)) {
    return true;
  }
  
  // Check TLD for government domains
  if (domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('.mil')) {
    return true;
  }
  
  return false;
}

function isSpoofedDomain(url) {
  const domain = getDomain(url);
  const spoofTargets = [
    'google', 'facebook', 'apple', 'microsoft', 'amazon', 'paypal',
    'netflix', 'instagram', 'twitter', 'linkedin', 'whatsapp',
    'chase', 'wellsfargo', 'bankofamerica'
  ];
  
  for (const target of spoofTargets) {
    if (domain.includes(target) && !isTrusted(url)) {
      return { spoofed: true, impersonated: target };
    }
  }
  return { spoofed: false };
}

// ── URL Scanning (Heuristic) ────────────────────────────────────────────────

function scanUrlOffline(url) {
  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  const urlLower = url.toLowerCase();
  const domain = getDomain(url);
  const regDomain = getRegisteredDomain(domain);
  
  // STEP 1: Spoof detection
  const spoof = isSpoofedDomain(url);
  if (spoof.spoofed) {
    return {
      url,
      risk_score: 90,
      prediction: 'PHISHING',
      reason: `Domain appears to impersonate a trusted service (${spoof.impersonated})`,
      source: 'spoof-detection'
    };
  }
  
  // STEP 2: Trusted domain check
  if (isTrusted(url)) {
    return {
      url,
      risk_score: 0,
      prediction: 'SAFE',
      reason: `Trusted domain (${regDomain})`,
      source: 'trusted-domain'
    };
  }
  
  // STEP 3: Rule-based heuristic scoring
  let score = 0;
  const reasons = [];
  
  // Suspicious structural patterns
  if (urlLower.includes('@')) {
    score += 25;
    reasons.push('contains @ symbol');
  }
  
  if ((urlLower.match(/-/g) || []).length > 3) {
    score += 15;
    reasons.push('excessive hyphens');
  }
  
  if ((urlLower.match(/\./g) || []).length > 4) {
    score += 15;
    reasons.push('excessive subdomains');
  }
  
  // IP address in URL
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(urlLower)) {
    score += 30;
    reasons.push('IP address in URL');
  }
  
  // Suspicious TLDs
  const suspiciousTlds = ['.xyz', '.top', '.click', '.link', '.buzz', '.gq', '.ml', '.cf', '.tk', '.ga', '.work', '.loan', '.racing'];
  for (const tld of suspiciousTlds) {
    if (domain.endsWith(tld)) {
      score += 20;
      reasons.push(`suspicious TLD (${tld})`);
      break;
    }
  }
  
  // Very long URL
  if (url.length > 100) {
    score += 10;
    reasons.push('unusually long URL');
  }
  if (url.length > 200) {
    score += 10;
    reasons.push('extremely long URL');
  }
  
  // HTTP instead of HTTPS
  if (url.startsWith('http://')) {
    score += 10;
    reasons.push('insecure HTTP connection');
  }
  
  // Phishing keywords in path/domain
  const phishingHits = [];
  for (const kw of PHISHING_KEYWORDS) {
    if (urlLower.includes(kw) && !isTrusted(url)) {
      phishingHits.push(kw);
    }
  }
  if (phishingHits.length > 0) {
    score = Math.max(score, 35);
    score += phishingHits.length * 5;
    reasons.push(`suspicious keywords: ${phishingHits.join(', ')}`);
  }
  
  // Scam keywords
  const scamHits = [];
  for (const kw of SCAM_KEYWORDS) {
    if (urlLower.includes(kw)) {
      scamHits.push(kw);
    }
  }
  if (scamHits.length > 0) {
    score += scamHits.length * 5;
    reasons.push(`scam keywords: ${scamHits.join(', ')}`);
  }
  
  // URL encoding tricks
  if (urlLower.includes('%') && (urlLower.includes('%2f') || urlLower.includes('%40') || urlLower.includes('%3a'))) {
    score += 15;
    reasons.push('URL encoding tricks detected');
  }
  
  // Multiple redirects
  if ((urlLower.match(/https?:\/\//g) || []).length > 1) {
    score += 20;
    reasons.push('multiple redirect URLs embedded');
  }
  
  score = Math.min(score, 100);
  
  // Classify
  let prediction;
  if (score >= 70) prediction = 'PHISHING';
  else if (score >= 40) prediction = 'SUSPICIOUS';
  else prediction = 'SAFE';
  
  // Build reason text
  let reasonText = 'Heuristic analysis';
  if (reasons.length > 0) {
    reasonText += ` | Detected: ${reasons.join(', ')}`;
  }
  if (score === 0) {
    reasonText = 'No suspicious patterns detected';
  }
  
  return {
    url,
    risk_score: score,
    prediction,
    reason: reasonText,
    source: 'heuristic'
  };
}

// ── Message Scanning (Heuristic) ────────────────────────────────────────────

function scanMessageOffline(message) {
  const msgLower = message.toLowerCase();
  let score = 0;
  const reasons = [];
  const detectedSignals = [];
  const matchedCategories = {};
  
  // Check each category of scam signals
  for (const [category, signals] of Object.entries(MESSAGE_SCAM_SIGNALS)) {
    const hits = [];
    for (const signal of signals) {
      if (msgLower.includes(signal)) {
        hits.push(signal);
        detectedSignals.push(signal);
      }
    }
    if (hits.length > 0) {
      matchedCategories[category] = hits;
    }
  }
  
  // Score based on signal categories detected
  const categoryCount = Object.keys(matchedCategories).length;
  
  if (matchedCategories.urgency) {
    score += matchedCategories.urgency.length * 8;
    reasons.push(`urgency language: ${matchedCategories.urgency.join(', ')}`);
  }
  if (matchedCategories.security) {
    score += matchedCategories.security.length * 7;
    reasons.push(`security triggers: ${matchedCategories.security.join(', ')}`);
  }
  if (matchedCategories.reward) {
    score += matchedCategories.reward.length * 8;
    reasons.push(`reward bait: ${matchedCategories.reward.join(', ')}`);
  }
  if (matchedCategories.threat) {
    score += matchedCategories.threat.length * 10;
    reasons.push(`threatening language: ${matchedCategories.threat.join(', ')}`);
  }
  if (matchedCategories.financial) {
    score += matchedCategories.financial.length * 7;
    reasons.push(`financial requests: ${matchedCategories.financial.join(', ')}`);
  }
  
  // Multi-category bonus (more categories = more suspicious)
  if (categoryCount >= 3) score += 15;
  else if (categoryCount >= 2) score += 8;
  
  // Check for links in message
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = msgLower.match(urlPattern) || [];
  if (urls.length > 0) {
    score += 5;
    // Check if any links look suspicious
    for (const foundUrl of urls) {
      const urlResult = scanUrlOffline(foundUrl);
      if (urlResult.risk_score > 40) {
        score += 15;
        reasons.push(`suspicious link detected: ${foundUrl.substring(0, 50)}...`);
        break;
      }
    }
  }
  
  // ALL CAPS detection
  const words = message.split(/\s+/);
  const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length >= 3) {
    score += 8;
    reasons.push('excessive use of ALL CAPS');
  }
  
  // Exclamation marks
  const exclamations = (message.match(/!/g) || []).length;
  if (exclamations >= 3) {
    score += 5;
    reasons.push('excessive exclamation marks');
  }
  
  score = Math.min(score, 100);
  
  // Classify
  let prediction;
  if (score >= 71) prediction = 'SCAM';
  else if (score >= 41) prediction = 'SUSPICIOUS';
  else prediction = 'SAFE';
  
  // Default reason
  if (reasons.length === 0) {
    reasons.push('No suspicious patterns detected');
  }
  
  return {
    risk_score: score,
    prediction,
    explanation: reasons.join(' | '),
    matched_patterns: matchedCategories,
    scam_signals: detectedSignals,
    source: 'heuristic'
  };
}


// ── Cache ───────────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getCached(key) {
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(key);
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}


// ── Main Scanner (built-in heuristics) ──────────────────────────────────────

function performScan(type, payload) {
  const cacheKey = JSON.stringify({ type, payload });
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  let result;
  if (type === 'url') {
    result = scanUrlOffline(payload.url);
  } else if (type === 'message') {
    result = scanMessageOffline(payload.message);
  } else {
    result = { prediction: 'ERROR', risk_score: 0, explanation: 'Unknown scan type' };
  }
  
  setCache(cacheKey, result);
  return result;
}


// ── Message Listener ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scan') {
    try {
      const result = performScan(request.type, request.data);
      sendResponse(result);
    } catch (err) {
      sendResponse({ error: err.message });
    }
    return true; // Keep message channel open
  }
  
  if (request.action === 'getAutoScanStatus') {
    chrome.storage.sync.get(['autoScanEnabled'], (result) => {
      sendResponse({ enabled: result.autoScanEnabled || false });
    });
    return true;
  }
});


// ── Auto-Scan on Navigation ─────────────────────────────────────────────────

const debounceMap = new Map();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    
    chrome.storage.sync.get(['autoScanEnabled'], (result) => {
      if (result.autoScanEnabled) {
        
        // Debounce to prevent spamming
        const now = Date.now();
        if (debounceMap.has(tabId) && now - debounceMap.get(tabId) < 2000) {
          return;
        }
        debounceMap.set(tabId, now);

        try {
          const data = performScan('url', { url: tab.url });
          
          // Send result to content script to display floating alert
          chrome.tabs.sendMessage(tabId, {
            action: 'showFloatingAlert',
            data: data,
            domain: new URL(tab.url).hostname
          }).catch(() => {
            // Content script might not be injected yet
          });
        } catch (error) {
          console.error("Auto scan failed:", error);
        }
      }
    });
  }
});
