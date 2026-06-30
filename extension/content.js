// content.js - Runs on all pages to handle floating alerts and email integration

// --- Floating Alert System ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showFloatingAlert') {
    showFloatingAlert(request.domain, request.data);
  }
});

function showFloatingAlert(domain, data) {
  // Remove existing alert if any
  let existing = document.getElementById('slixblock-floating-alert');
  if (existing) {
    existing.remove();
  }

  const alertDiv = document.createElement('div');
  alertDiv.id = 'slixblock-floating-alert';
  
  let predictionStr = data.prediction?.toUpperCase() || 'UNKNOWN';
  let statusClass = 'slix-suspicious';
  
  if (predictionStr === 'SAFE' || predictionStr === 'TRUSTED') {
    statusClass = 'slix-safe';
    predictionStr = 'SAFE';
  } else if (predictionStr === 'PHISHING' || predictionStr === 'MALICIOUS') {
    statusClass = 'slix-phishing';
    predictionStr = 'PHISHING';
  }
  
  alertDiv.className = statusClass;
  
  alertDiv.innerHTML = `
    <div class="slix-header">
      <div class="slix-domain">${domain}</div>
      <div class="slix-badge">${predictionStr}</div>
    </div>
    <div class="slix-body">
      ${data.explanation || 'Analyzed by PhishGuard AI'}
    </div>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Trigger animation
  setTimeout(() => {
    alertDiv.classList.add('show');
  }, 100);
  
  // Auto remove after 5.5 seconds
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 400);
  }, 5500);
}

// --- Email Integration ---
// Detect if we are on a known webmail client
const isGmail = window.location.hostname.includes('mail.google.com');
const isYahoo = window.location.hostname.includes('mail.yahoo.com');
const isOutlook = window.location.hostname.includes('outlook.live.com') || window.location.hostname.includes('outlook.office.com') || window.location.hostname.includes('outlook.office365.com');

if (isGmail || isYahoo || isOutlook) {
  // Simple polling to find open emails and inject banner
  setInterval(injectEmailBanner, 2000);
}

function injectEmailBanner() {
  let emailContainers = [];
  
  if (isGmail) {
    // Gmail open email body container
    emailContainers = document.querySelectorAll('.a3s.aiL:not(.slix-processed)');
  } else if (isYahoo) {
    // Yahoo mail body
    emailContainers = document.querySelectorAll('.msg-body:not(.slix-processed)');
  } else if (isOutlook) {
    // Outlook reading pane
    emailContainers = document.querySelectorAll('[aria-label="Message body"]:not(.slix-processed)');
  }

  emailContainers.forEach(container => {
    container.classList.add('slix-processed');
    
    const banner = document.createElement('div');
    banner.className = 'slixblock-email-banner';
    banner.innerHTML = `
      <div class="slix-banner-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        SlixBlock: Scan this message for phishing
      </div>
      <button class="slix-banner-btn">Scan Now</button>
    `;
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'slix-email-result';
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(banner);
    wrapper.appendChild(resultDiv);
    
    // Insert banner at the top of the email
    container.insertBefore(wrapper, container.firstChild);
    
    const scanBtn = banner.querySelector('.slix-banner-btn');
    scanBtn.addEventListener('click', () => {
      scanBtn.textContent = 'Scanning...';
      scanBtn.disabled = true;
      
      // Extract text content (safely, avoiding script tags)
      const emailText = container.innerText || container.textContent;
      // Truncate if too long
      const truncatedText = emailText.substring(0, 5000);
      
      chrome.runtime.sendMessage({ action: 'scan', type: 'message', data: { message: truncatedText } }, (response) => {
        scanBtn.textContent = 'Scan Now';
        scanBtn.disabled = false;
        
        if (chrome.runtime.lastError || response.error) {
          resultDiv.textContent = 'Error scanning message: ' + (chrome.runtime.lastError?.message || response.error);
          resultDiv.style.background = 'rgba(239, 68, 68, 0.1)';
          resultDiv.style.color = '#ef4444';
          resultDiv.style.borderLeft = '4px solid #ef4444';
        } else {
          let pred = response.prediction?.toUpperCase();
          if (pred === 'SAFE' || pred === 'TRUSTED') {
            resultDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            resultDiv.style.color = '#10b981';
            resultDiv.style.borderLeft = '4px solid #10b981';
          } else if (pred === 'PHISHING' || pred === 'MALICIOUS') {
            resultDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            resultDiv.style.color = '#ef4444';
            resultDiv.style.borderLeft = '4px solid #ef4444';
          } else {
            resultDiv.style.background = 'rgba(245, 158, 11, 0.1)';
            resultDiv.style.color = '#f59e0b';
            resultDiv.style.borderLeft = '4px solid #f59e0b';
          }
          resultDiv.innerHTML = `<strong>${pred}</strong> (Score: ${(response.risk_score || 0).toFixed(2)})<br>${response.explanation}`;
        }
        resultDiv.classList.add('show');
      });
    });
  });
}
