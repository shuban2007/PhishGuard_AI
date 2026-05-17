# PhishGuard AI
Smart phishing detection for URLs and messages using machine learning and threat intelligence

⭐ Star this repo if you found it useful
🚀 Overview
PhishGuard AI is a hybrid cybersecurity system that analyzes websites and messages to detect phishing and scam attempts in real time

It combines machine learning, keyword intelligence, and trusted domain validation to provide accurate and explainable results

✨ Features
🔍 Real time URL scanning with risk scoring
💬 Message and SMS scam detection
🧠 Machine learning based predictions
🌐 Google Safe Browsing integration
🛡️ Trusted domain recognition
⚡ Rule based and keyword intelligence system
🔄 Fail safe architecture with guaranteed response
📊 Clear and explainable results

🧱 Tech Stack
Frontend
React with Vite

Backend
FastAPI

Machine Learning
Scikit learn

APIs
Google Safe Browsing

Deployment
Frontend on Netlify
Backend on Render or Railway

🧭 How It Works
1 User submits a URL or message
2 Frontend sends request to backend
3 Backend processes using multiple detection layers
4 Risk score and prediction are returned
5 User sees clear result with explanation

🔗 API Endpoints
GET /
Returns service status

GET /health
Returns system diagnostics

POST /scan-url
Analyzes a URL and returns risk score and prediction

POST /scan-message
Analyzes a message and returns scam likelihood and intent

🧠 Detection System
URL Analysis
Safe Browsing check
Trusted domain validation
Machine learning prediction
Rule based scoring
Keyword boosting
Final classification

Message Analysis
Machine learning scoring
Keyword intelligence engine
Context aware boosting
False positive reduction
Intent detection
Final classification

⚙️ Setup
Clone Repository
git clone https://github.com/your-username/PhishGuard_AI.git
cd PhishGuard_AI
Backend Setup
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
Frontend Setup
cd frontend
npm install
npm run dev
🔐 Environment Variables
Backend

SAFE_BROWSING_API_KEY your_api_key
Frontend

VITE_API_URL your_backend_url
🖥️ Usage
Enter a URL to check if it is safe
Enter a message to detect scam patterns
View risk score and explanation

🛡️ Security Principles
No user data stored
Fail safe responses
Trusted domain filtering
Multi layer detection system

📈 Future Improvements
Browser extension integration
Advanced NLP models
User reporting system
Real time threat updates
Mobile application

👥 Team
SlixCrew

Focused on building useful and practical cybersecurity solutions
Open to collaboration and new contributors

📄 License
For educational and research purposes

