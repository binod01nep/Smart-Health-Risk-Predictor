Smart Health Risk Predictor 🫀
An ML-powered health risk assessment tool that provides instant, personalized risk scores based on 8 key health metrics. Built with React and FastAPI.

✨ Features
XGBoost ML Model - High-accuracy predictions from real health patterns

Real-time Scoring - Get risk score (0-40) in milliseconds

Priority Recommendations - See top 3 factors affecting your health

Privacy First - Zero data stored, no accounts needed

Dark/Light Theme - Smooth theme switching

Interactive Visuals - Animated gauges and contribution bars

🛠️ Tech Stack
Frontend: React, Material-UI, CSS-in-JS

Backend: FastAPI, Python, XGBoost

ML: Scikit-learn, Pandas, NumPy

📊 Input Metrics
Metric	Range
Age	18-80 years
BMI	10-45
Daily Steps	0-17,000
Exercise	0-8.5 hrs/week
Sleep	2-12 hrs/day
Blood Sugar	50-200 mg/dL
Blood Pressure	60-180 mmHg
Smoking	Yes/No
🚀 Quick Start
Prerequisites
Python 3.8+

Node.js 14+

npm or yarn

Backend Setup
bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
Backend runs at http://localhost:8000

Frontend Setup
bash
cd frontend
npm install
npm start
Frontend runs at http://localhost:3000

📁 Project Structure
text
health-risk-predictor/
├── frontend/               # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                # FastAPI app
│   ├── main.py
│   ├── model.py
│   └── requirements.txt
├── .gitignore
└── README.md
📝 API Documentation
Once backend is running, visit http://localhost:8000/docs for interactive API docs.

⚠️ Disclaimer
For educational purposes only - This is NOT a medical diagnosis tool. Always consult healthcare professionals for medical advice.