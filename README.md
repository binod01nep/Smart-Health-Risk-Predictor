Smart Health Risk Predictor 🫀
An ML-powered web application that predicts health risk scores using XGBoost. Enter 8 health metrics and get an instant risk assessment with personalized recommendations.

https://frontend/image.png

✨ Features
ML-Powered Predictions - XGBoost model trained on real health data

Instant Results - Get risk score (0-40) in milliseconds

Personalized Recommendations - Top 3 priority-based suggestions

Privacy First - Zero data stored, no login required

Dark/Light Theme - Smooth theme switching

Interactive Visuals - Animated gauges and contribution bars

🛠️ Tech Stack
Frontend
React 18

Material-UI v5

CSS-in-JS styling

Responsive design

Backend
FastAPI (Python)

XGBoost ML model

Scikit-learn

Pydantic validation

📊 Input Metrics
Metric	Range	Description
Age	18-80 years	Your current age
BMI	10-45	Body Mass Index
Daily Steps	0-17,000	Average steps per day
Exercise	0-8.5 hrs/week	Physical activity
Sleep	2-12 hrs/day	Average sleep duration
Blood Sugar	50-200 mg/dL	Fasting glucose level
Blood Pressure	60-180 mmHg	Systolic pressure
Smoking	Yes/No	Smoking status
🚀 Quick Start
Prerequisites
Python 3.8+

Node.js 14+

npm or yarn

Backend Setup
bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

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
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   └── HealthRiskApp.jsx
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── backend/                # FastAPI application
│   ├── main.py            # API endpoints
│   ├── models/            # Trained XGBoost models
│   ├── healthrisk.csv     # Training data
│   └── requirements.txt   # Python dependencies
├── .gitignore
└── README.md
📝 API Documentation
Once backend is running, visit http://localhost:8000/docs for interactive Swagger documentation.

Endpoint: POST /predict
Request Body:

json
{
  "age": 42,
  "bmi": 26.6,
  "daily_steps": 7654,
  "exercise_hours_week": 4.1,
  "sleep_hours": 7.3,
  "blood_sugar": 119,
  "blood_pressure": 136,
  "smoking": 0
}
Response:

json
{
  "risk_score": 13.6,
  "risk_level": "MODERATE RISK",
  "suggestions": [
    {
      "factor": "age",
      "label": "Age",
      "message": "Your age contributes moderately to your risk score"
    }
  ],
  "inputs": {...}
}
🎯 Risk Levels
Score Range	Risk Level
0-10	LOW RISK
11-20	MODERATE RISK
21-40	HIGH RISK
⚠️ Disclaimer
For educational purposes only - This is NOT a medical diagnosis tool. Always consult healthcare professionals for medical advice.

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
MIT License - see below for details

text
MIT License

Copyright (c) 2026 Binod Budha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
📧 Contact
Binod Budha - @binod01nep

Project Link: https://github.com/binod01nep/Smart-Health-Risk-Predictor

Made with 🫀 for better health awareness
