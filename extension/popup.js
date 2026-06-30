document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const autoScanToggle = document.getElementById('auto-scan-toggle');
  const scanBtn = document.getElementById('scan-btn');
  const urlInput = document.getElementById('url-input');
  const messageInput = document.getElementById('message-input');
  const resultContainer = document.getElementById('result-container');
  const resultCard = document.getElementById('result-card');
  const resultPrediction = document.getElementById('result-prediction');
  const resultScore = document.getElementById('result-score');
  const resultExplanation = document.getElementById('result-explanation');
  const scanLoader = document.getElementById('scan-loader');
  const btnText = scanBtn.querySelector('span');
  const scoreBarFill = document.getElementById('score-bar-fill');

  let currentTab = 'url-scan';

  // Load auto-scan setting
  chrome.storage.sync.get(['autoScanEnabled'], (result) => {
    autoScanToggle.checked = result.autoScanEnabled || false;
  });

  // Pre-fill current URL if empty
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
      urlInput.value = tabs[0].url;
    }
  });

  // Toggle Auto-Scan
  autoScanToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ autoScanEnabled: e.target.checked });
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-target');
      document.getElementById(currentTab).classList.add('active');
      resultContainer.classList.add('hidden');

      // Update button text based on active tab
      if (currentTab === 'message-scan') {
        btnText.textContent = 'Scan on PhishGuard AI ↗';
      } else {
        btnText.textContent = 'Scan Now';
      }
    });
  });

  // Scan action
  scanBtn.addEventListener('click', async () => {
    if (currentTab === 'message-scan') {
      // ── Message Scan: Open PhishGuard AI website for full AI-powered analysis ──
      // This keeps the backend URL private (not exposed in extension code)
      const message = messageInput.value.trim();
      if (!message) return;

      const scanUrl = `https://phishguardai-byslixcrew.netlify.app/scan-message?message=${encodeURIComponent(message)}`;
      chrome.tabs.create({ url: scanUrl });
      return;
    }

    // ── URL Scan: Use built-in heuristic engine ──
    const url = urlInput.value.trim();
    if (!url) return;
    const payload = { url };
    const endpoint = 'url';

    // UI Loading state
    btnText.classList.add('hidden');
    scanLoader.classList.remove('hidden');
    scanBtn.disabled = true;
    resultContainer.classList.add('hidden');

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'scan', type: endpoint, data: payload }, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (res.error) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        });
      });

      displayResult(response);
    } catch (error) {
      displayResult({
        prediction: 'ERROR',
        risk_score: 0,
        explanation: error.message || 'Failed to connect to PhishGuard backend.'
      });
    } finally {
      btnText.classList.remove('hidden');
      scanLoader.classList.add('hidden');
      scanBtn.disabled = false;
    }
  });

  function displayResult(data) {
    resultCard.className = 'result-card'; // Reset classes
    
    let predictionStr = data.prediction?.toUpperCase() || 'UNKNOWN';
    const riskScore = data.risk_score || 0;

    if (predictionStr === 'SAFE' || predictionStr === 'TRUSTED') {
      resultCard.classList.add('status-safe');
      predictionStr = 'SAFE';
    } else if (predictionStr === 'SUSPICIOUS') {
      resultCard.classList.add('status-suspicious');
    } else if (predictionStr === 'PHISHING' || predictionStr === 'MALICIOUS' || predictionStr === 'SCAM') {
      resultCard.classList.add('status-phishing');
      if (predictionStr === 'SCAM') predictionStr = 'SCAM';
      else predictionStr = 'PHISHING';
    } else {
      resultCard.classList.add('status-suspicious'); // Default for error
    }

    resultPrediction.textContent = predictionStr;
    resultScore.textContent = `Score: ${riskScore.toFixed(2)}`;

    // Use 'reason' or 'explanation' from the response
    const explanationText = data.explanation || data.reason || 'No explanation provided.';
    resultExplanation.textContent = explanationText;
    
    // Animate score bar
    const scorePercent = Math.min(100, Math.max(0, riskScore));
    scoreBarFill.style.width = `${scorePercent}%`;
    
    // Color the bar based on score
    if (scorePercent <= 30) {
      scoreBarFill.style.background = 'var(--safe)';
    } else if (scorePercent <= 60) {
      scoreBarFill.style.background = 'var(--suspicious)';
    } else {
      scoreBarFill.style.background = 'var(--phishing)';
    }
    
    resultContainer.classList.remove('hidden');
  }
});
