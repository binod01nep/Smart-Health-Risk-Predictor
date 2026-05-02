# 🫀 Smart Health Risk Predictor

An **ML-powered web application** that predicts a person’s **health risk score** using an **XGBoost machine learning model**.

Users enter **8 health metrics**, and the system instantly calculates a **risk score (0–40)** along with **personalized health recommendations**.

---
## ✨ Features

- 🤖 **ML-Powered Predictions**  
  XGBoost model trained on health data.

- ⚡ **Instant Results**  
  Get risk score in milliseconds.

- 🎯 **Personalized Recommendations**  
  Top 3 priority-based health suggestions.

- 🔒 **Privacy First**  
  No login required and **no data stored**.

- 🌙 **Dark / Light Theme**  
  Smooth theme switching.

- 📊 **Interactive Visualizations**  
  Animated gauges and contribution charts.

---

# 🛠️ Tech Stack

## Frontend
- React 18
- Material UI v5
- CSS-in-JS styling
- Responsive design

## Backend
- FastAPI (Python)
- XGBoost Machine Learning Model
- Scikit-learn
- Pydantic Validation

---

# 📊 Input Metrics

| Metric | Range | Description |
|------|------|------|
| Age | 18 – 80 years | Current age |
| BMI | 10 – 45 | Body Mass Index |
| Daily Steps | 0 – 17,000 | Average steps per day |
| Exercise | 0 – 8.5 hrs/week | Weekly physical activity |
| Sleep | 2 – 12 hrs/day | Average sleep duration |
| Blood Sugar | 50 – 200 mg/dL | Fasting glucose level |
| Blood Pressure | 60 – 180 mmHg | Systolic pressure |
| Smoking | Yes / No | Smoking status |

---

# 🚀 Quick Start

## Prerequisites

Make sure you have installed:

- **Python 3.8+**
- **Node.js 14+**
- **npm or yarn**

---

# ⚙️ Backend Setup

Open terminal and run:

```bash
cd backend
python -m venv venv
```

### Activate Virtual Environment

**Windows**

```bash
venv\Scripts\activate
```

**Mac / Linux**

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start Backend Server

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

# ⚙️ Frontend Setup

Open another terminal and run:

```bash
cd frontend
npm install
```

### Start React Application

```bash
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

# 📁 Project Structure

```
Smart-Health-Risk-Predictor
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   └── HealthRiskApp.jsx
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── healthrisk.csv
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

# 📑 API Documentation

Once the backend is running, open:

```
http://localhost:8000/docs
```

This provides **interactive Swagger documentation** to test the API.

---

# 🔗 API Endpoint

### POST `/predict`

### Request Body

```json
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
```

### Response

```json
{
  "risk_score": 13.6,
  "risk_level": "MODERATE RISK",
  "suggestions": [
    {
      "factor": "age",
      "label": "Age",
      "message": "Your age contributes moderately to your risk score"
    }
  ]
}
```

---

# 🎯 Risk Levels

| Score Range | Risk Level |
|-------------|------------|
| 0 – 10 | LOW RISK |
| 11 – 20 | MODERATE RISK |
| 21 – 40 | HIGH RISK |

---

# ⚠️ Disclaimer

This project is **for educational purposes only**.

It is **NOT a medical diagnosis tool**.  
Always consult a **qualified healthcare professional** for medical advice.

---

# 🤝 Contributing

Contributions are welcome.

```bash
# Fork the repository

# Create new branch
git checkout -b feature/AmazingFeature

# Commit your changes
git commit -m "Add AmazingFeature"

# Push to branch
git push origin feature/AmazingFeature
```

Then open a **Pull Request**.

---

# 📄 License

MIT License

```
Copyright (c) 2026 Binod Budha

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software
and associated documentation files...
```

---

# 📧 Contact

**Binod Budha**

GitHub:  
https://github.com/binod01nep

Project Repository:  
https://github.com/binod01nep/Smart-Health-Risk-Predictor

---

❤️ Made with passion to promote health awareness
