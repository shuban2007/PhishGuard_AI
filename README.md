# PhishGuard AI
PhishGuard AI is a smart phishing detection system designed to analyze URLs and messages using a hybrid approach that combines machine learning, threat intelligence, and rule based analysis

# Overview
PhishGuard AI helps users identify potentially harmful links and suspicious messages in real time The system is built to reduce phishing risks and improve online safety through accurate and explainable detection

# Key Features
Hybrid detection system combining multiple layers
Real time URL scanning with risk scoring
SMS and message analysis with intent detection
Google Safe Browsing integration for threat intelligence
Machine learning based prediction models
Keyword intelligence for scam pattern detection
Trusted domain recognition to reduce false positives
Fail safe architecture that always returns a result

# Technology Stack
Frontend
React with Vite

Backend
FastAPI

# Machine Learning
Scikit learn models for URL and message classification

# APIs
Google Safe Browsing API

# Deployment
Frontend hosted on Netlify
Backend hosted on Render or Railway

# System Architecture
Frontend sends user input to backend API
Backend processes input using multiple detection layers
Results are returned with risk score prediction and explanation

API Endpoints
GET
/
Health check endpoint

GET
/health
Detailed system status

POST
/scan url
Analyzes a URL and returns risk score and prediction

POST
/scan message
Analyzes a message and returns scam likelihood and intent

# Detection Pipeline
URL Detection
Safe Browsing check
Trusted domain validation
Machine learning prediction
Rule based analysis
Keyword boosting
Final classification

# Message Detection
Machine learning probability scoring
Keyword intelligence engine
Context aware boosting
False positive reduction
Intent classification
Final scoring and prediction

# Setup Instructions
Clone the repository

git clone https://github.com/your username/PhishGuard_AI.git

Navigate to project
cd PhishGuard_AI
Backend Setup
cd backend
pip install -r requirements.txt
python -m uvicorn main app --reload

Frontend Setup
cd frontend
npm install
npm run dev
Environment Variables
Backend

SAFE_BROWSING_API_KEY your api key

Frontend

VITE_API_URL your backend url

# Usage
Enter a URL to check if it is safe or malicious
Enter a message to detect scam or phishing patterns
Review risk score prediction and explanation

# Security Features
No logs stored for user inputs
Fail safe response system
Trusted domain validation
Multi layer detection to reduce false negatives

# Future Improvements
Browser extension integration
Advanced NLP for message understanding
User reporting system
Real time threat database updates
Mobile application support

# Team
SlixCrew

Focused on building useful and practical cybersecurity solutions
Open to collaboration and new contributors

# License
This project is intended for educational and research purposes

