# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import xgboost as xgb
import pandas as pd
import numpy as np
import joblib
import os
from typing import Literal
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, accuracy_score

app = FastAPI(title="Health Risk Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
CSV_FILE = "healthrisk.csv"
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

RISK_MODEL_PATH = os.path.join(MODELS_DIR, "xgb_risk.json")
SUG_MODEL_PATH  = os.path.join(MODELS_DIR, "xgb_sug.json")
LABELS_PATH     = os.path.join(MODELS_DIR, "suggestion_labels.pkl")

# Global models
model_risk = None
model_sug = None
suggestion_labels = None

def add_features(d: pd.DataFrame) -> pd.DataFrame:
    df = d.copy()
    df['Age_BMI']         = df['Age'] * df['BMI']
    df['Age_squared']     = df['Age'] ** 2
    df['BMI_squared']     = df['BMI'] ** 2
    df['Steps_per_BMI']   = df['Daily_steps'] / (df['BMI'] + 1)
    df['Sugar_pressure']  = df['Blood_sugar'] * df['Blood_pressure']
    df['Sugar_age']       = df['Blood_sugar'] * df['Age']
    df['Sleep_deficit']   = np.maximum(0, 7 - df['Sleep_hours'])
    df['Sleep_excess']    = np.maximum(0, df['Sleep_hours'] - 9)
    df['Age_steps_ratio'] = df['Age'] / (df['Daily_steps'] + 1)
    df['Exercise_age']    = df['Exercise_hours_week'] / (df['Age'] + 1)
    df['Log_steps']       = np.log1p(df['Daily_steps'])
    return df


# ─── All suggestion messages per factor ──────────────────────────────────────

SUGGESTIONS = {
    'low': {
        'steps':     ("🚶 Low Activity",        "Try to reach 8,000 steps daily for optimal heart health."),
        'exercise':  ("🏃 Light Exercise",       "Add a 20-minute daily walk to improve your cardiovascular score."),
        'sleep_low': ("😴 More Sleep Needed",    "Aim for at least 7 hours of sleep for better recovery and health."),
        'sleep_hi':  ("🛌 Too Much Sleep",       "Slightly reduce sleep to 7–8 hours for optimal body function."),
        'bmi_hi':    ("⚖️ BMI Slightly High",   "A balanced diet and light activity will help bring BMI down."),
        'bmi_low':   ("⚖️ BMI Slightly Low",    "Focus on nutritious, calorie-dense foods to reach a healthy weight."),
        'sugar_hi':  ("🍬 Blood Sugar",          "Reduce sugary snacks and drinks to keep blood sugar in check."),
        'sugar_low': ("🍬 Low Blood Sugar",      "Ensure regular balanced meals to maintain steady blood sugar."),
        'bp_hi':     ("🫀 Blood Pressure",       "Reduce salt intake and try relaxation techniques for better BP."),
        'bp_low':    ("🫀 Low Blood Pressure",   "Stay hydrated and avoid prolonged standing."),
        'smoking':   ("🚬 Smoking",              "Quitting smoking now will dramatically improve your long-term health."),
        'age':       ("📅 Age Factor",           "Keep up regular annual health screenings as a preventive measure."),
    },
    'moderate': {
        'steps':     ("🚶 Low Activity",        "Your low activity is a concern — aim for 10,000 steps every day."),
        'exercise':  ("🏃 Exercise Deficit",     "Consult a fitness trainer for a structured weekly exercise plan."),
        'sleep_low': ("😴 Sleep Deprivation",    "Poor sleep is raising your risk — establish a consistent sleep schedule."),
        'sleep_hi':  ("🛌 Excess Sleep",         "Excessive sleep can signal health issues — consult your doctor."),
        'bmi_hi':    ("⚖️ Elevated BMI",        "Work with a nutritionist to create a sustainable weight loss plan."),
        'bmi_low':   ("⚖️ Low BMI",             "Your low BMI is risky — consult a dietitian for a nutrition plan."),
        'sugar_hi':  ("🍬 High Blood Sugar",     "Consult a doctor to check for pre-diabetes and adjust your diet."),
        'sugar_low': ("🍬 Low Blood Sugar",      "Low blood sugar detected — seek dietary advice from your doctor."),
        'bp_hi':     ("🫀 High Blood Pressure",  "Monitor BP daily and consult a doctor about medication options."),
        'bp_low':    ("🫀 Low Blood Pressure",   "Consistently low BP — consult a doctor to rule out underlying causes."),
        'smoking':   ("🚬 Smoking Risk",         "Smoking is your top risk factor — seek a cessation program now."),
        'age':       ("📅 Age Risk",             "At your age, bi-annual checkups and heart monitoring are essential."),
    },
    'high': {
        'steps':     ("🚶 Critical Inactivity",  "Start a medically supervised exercise program immediately."),
        'exercise':  ("🏃 Urgent Exercise",      "Consult a cardiologist for a safe, structured exercise plan."),
        'sleep_low': ("😴 Severe Sleep Loss",    "Severe sleep deprivation is critically dangerous — seek urgent medical help."),
        'sleep_hi':  ("🛌 Abnormal Sleep",       "Abnormal sleep duration is a serious warning sign — see a doctor urgently."),
        'bmi_hi':    ("⚖️ Severe Obesity",      "Severe BMI — consult a bariatric specialist immediately."),
        'bmi_low':   ("⚖️ Severely Underweight","Seek immediate nutritional and medical intervention."),
        'sugar_hi':  ("🍬 Dangerous Sugar",      "Blood sugar at dangerous levels — seek immediate diabetes evaluation."),
        'sugar_low': ("🍬 Critical Sugar",       "Critically low blood sugar — seek emergency medical attention."),
        'bp_hi':     ("🫀 Hypertensive Crisis",  "Dangerously high blood pressure — seek emergency medical care now."),
        'bp_low':    ("🫀 Critical BP",          "Critically low blood pressure — seek emergency medical care immediately."),
        'smoking':   ("🚬 Critical Smoking",     "Smoking is critically destroying your health — seek immediate medical support."),
        'age':       ("📅 High-Risk Age",        "An immediate full health screening is strongly advised."),
    },
}


def get_tier(score: float) -> str:
    if score < 15:   return 'low'
    elif score < 35: return 'moderate'
    else:            return 'high'


# ─── Hard thresholds: a factor is only "compromised" if it crosses these ─────
# Each entry: (factor_key, is_compromised_fn, raw_contribution_fn)
# is_compromised_fn returns True only when the value is genuinely outside
# the healthy/acceptable range — not just "could be slightly better".

FACTOR_RULES = [
    # key         compromised when...                         contribution (matches frontend factorContrib)
    ('smoking',   lambda r: r['Smoking'] == 1,               lambda r: 7.0),
    ('age',       lambda r: r['Age'] >= 45,                  lambda r: (r['Age'] - 18) * 0.30),
    ('bmi_hi',    lambda r: r['BMI'] > 27.5,                 lambda r: (r['BMI'] - 25) * 0.80),
    ('bmi_low',   lambda r: r['BMI'] < 17.5,                 lambda r: (18.5 - r['BMI']) * 0.60),
    ('sugar_hi',  lambda r: r['Blood_sugar'] > 110,          lambda r: (r['Blood_sugar'] - 100) * 0.15),
    ('sugar_low', lambda r: r['Blood_sugar'] < 70,           lambda r: (100 - r['Blood_sugar']) * 0.10),
    ('bp_hi',     lambda r: r['Blood_pressure'] > 130,       lambda r: (r['Blood_pressure'] - 120) * 0.12),
    ('bp_low',    lambda r: r['Blood_pressure'] < 75,        lambda r: (80 - r['Blood_pressure']) * 0.15),
    ('sleep_low', lambda r: r['Sleep_hours'] < 6.0,          lambda r: (7 - r['Sleep_hours']) * 1.20),
    ('sleep_hi',  lambda r: r['Sleep_hours'] > 9.5,          lambda r: (r['Sleep_hours'] - 9) * 0.60),
    ('steps',     lambda r: r['Daily_steps'] < 5000,         lambda r: (10000 - r['Daily_steps']) * 0.001),
    ('exercise',  lambda r: r['Exercise_hours_week'] < 1.5,  lambda r: (4 - r['Exercise_hours_week']) * 0.80),
]


def get_compromised_factors(row: dict, score: float) -> list:
    """
    Returns only factors that are genuinely compromised, sorted by contribution.
    Each item: (factor_key, contribution_score)
    """
    tier = get_tier(score)
    compromised = []

    for key, is_bad, contrib_fn in FACTOR_RULES:
        # Skip age suggestion entirely for low risk — not actionable
        if key == 'age' and tier == 'low':
            continue
        if is_bad(row):
            compromised.append((key, contrib_fn(row)))

    # Sort by contribution descending
    compromised.sort(key=lambda x: x[1], reverse=True)
    return compromised


def generate_suggestion(row) -> str:
    """Used only during CSV labelling — returns single top suggestion text."""
    compromised = get_compromised_factors(dict(row), row['Health_Risk_Score'])
    if not compromised:
        return "Maintain your healthy lifestyle — you're doing great!"
    top_key = compromised[0][0]
    tier = get_tier(row['Health_Risk_Score'])
    return SUGGESTIONS[tier][top_key][1]


def get_top_suggestions(input_row: dict, score: float, top_n: int = 4) -> list:
    """
    Returns only suggestions for factors that are ACTUALLY compromised.
    Never suggests fixing something that is already in the healthy range.
    Returns between 1 and top_n items (could be fewer if fewer factors are bad).
    """
    compromised = get_compromised_factors(input_row, score)
    tier = get_tier(score)

    # Cap at top_n but never pad with healthy factors
    compromised = compromised[:top_n]

    if not compromised:
        # Everything is healthy — return a single positive message
        return [{
            "factor":       "healthy",
            "label":        "✅ Great Health Profile",
            "message":      "All your metrics are within healthy ranges. Keep up your current lifestyle!",
            "contribution": 0.0,
        }]

    results = []
    for factor_key, contribution in compromised:
        label, message = SUGGESTIONS[tier][factor_key]
        results.append({
            "factor":       factor_key,
            "label":        label,
            "message":      message,
            "contribution": round(contribution, 3),
        })
    return results


# =============================================
# LOAD OR TRAIN
# =============================================

if os.path.exists(RISK_MODEL_PATH) and os.path.exists(SUG_MODEL_PATH) and os.path.exists(LABELS_PATH):
    print("Loading pre-trained models...")
    model_risk = xgb.XGBRegressor()
    model_risk.load_model(RISK_MODEL_PATH)

    model_sug = xgb.XGBClassifier()
    model_sug.load_model(SUG_MODEL_PATH)

    suggestion_labels = joblib.load(LABELS_PATH)
    print("Models loaded successfully.")
else:
    print("Training models from CSV...")

    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"{CSV_FILE} not found! Place it in the backend folder.")

    df = pd.read_csv(CSV_FILE)
    print(f"Loaded {len(df)} rows")

    required = ['Age', 'BMI', 'Daily_steps', 'Exercise_hours_week',
                'Sleep_hours', 'Blood_sugar', 'Blood_pressure', 'Smoking',
                'Health_Risk_Score']
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing columns: {missing}")

    if 'Suggestion' not in df.columns:
        print("Generating Suggestion column...")
        df['Suggestion'] = df.apply(generate_suggestion, axis=1)

    # Filter rare suggestions
    counts = df['Suggestion'].value_counts()
    df = df[df['Suggestion'].isin(counts[counts >= 5].index)].reset_index(drop=True)
    print(f"After filter: {len(df)} rows, {df['Suggestion'].nunique()} suggestions")

    df_fe = add_features(df)
    feat_cols_reg = [c for c in df_fe.columns if c not in ['Health_Risk_Score', 'Suggestion']]

    # Regressor
    X_reg = df_fe[feat_cols_reg]
    y_reg = df_fe['Health_Risk_Score']
    X_tr_r, X_te_r, y_tr_r, y_te_r = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)

    model_risk = xgb.XGBRegressor(
        n_estimators=1000, learning_rate=0.02, max_depth=6,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
        reg_alpha=0.1, reg_lambda=1.0, random_state=42,
        early_stopping_rounds=50, eval_metric='rmse', verbosity=0
    )
    model_risk.fit(X_tr_r, y_tr_r, eval_set=[(X_te_r, y_te_r)], verbose=False)

    print(f"Regressor R²:  {r2_score(y_te_r, model_risk.predict(X_te_r)):.4f}")
    print(f"Regressor MAE: {mean_absolute_error(y_te_r, model_risk.predict(X_te_r)):.4f}")

    # Classifier
    df_fe['Predicted_Risk'] = model_risk.predict(df_fe[feat_cols_reg])
    feat_cols_clf = feat_cols_reg + ['Predicted_Risk']

    le = LabelEncoder()
    y_clf = le.fit_transform(df['Suggestion'])

    X_clf = df_fe[feat_cols_clf]
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X_clf, y_clf, test_size=0.2, random_state=42)

    model_sug = xgb.XGBClassifier(
        n_estimators=500, learning_rate=0.05, max_depth=6,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric='mlogloss', random_state=42, verbosity=0
    )
    model_sug.fit(X_tr_c, y_tr_c)

    print(f"Classifier Accuracy: {accuracy_score(y_te_c, model_sug.predict(X_te_c)):.4f}")

    # Save
    model_risk.save_model(RISK_MODEL_PATH)
    model_sug.save_model(SUG_MODEL_PATH)
    joblib.dump(dict(enumerate(le.classes_)), LABELS_PATH)
    print("Models saved.")


# =============================================
# PREDICT ENDPOINT
# =============================================

class HealthInput(BaseModel):
    age: int = Field(..., ge=18, le=80)
    bmi: float = Field(..., ge=10.0, le=45.0)
    daily_steps: int = Field(..., ge=0, le=17000)
    exercise_hours_week: float = Field(..., ge=0.0, le=8.5)
    sleep_hours: float = Field(..., ge=2.0, le=12.0)
    blood_sugar: int = Field(..., ge=50, le=200)
    blood_pressure: int = Field(..., ge=60, le=180)
    smoking: Literal[0, 1]

@app.post("/predict")
async def predict(data: HealthInput):
    try:
        input_row = {
            'Age':                  data.age,
            'BMI':                  data.bmi,
            'Daily_steps':          data.daily_steps,
            'Exercise_hours_week':  data.exercise_hours_week,
            'Sleep_hours':          data.sleep_hours,
            'Blood_sugar':          data.blood_sugar,
            'Blood_pressure':       data.blood_pressure,
            'Smoking':              data.smoking,
        }

        input_df = pd.DataFrame([input_row])
        df_fe    = add_features(input_df)

        raw_score = float(model_risk.predict(df_fe)[0])
        score     = max(0.0, min(40.0, raw_score))

        # Top 3 rule-based suggestions (deterministic, always accurate)
        suggestions = get_top_suggestions(input_row, score, top_n=3)
        print(f"[predict] score={score:.2f} tier={get_tier(score)} suggestions={[s['factor'] for s in suggestions]}")

        if score < 10:
            level, icon, meter = "LOW RISK",       "🟢", "███░░░░░░░"
        elif score < 20:
            level, icon, meter = "MODERATE RISK",  "🟡", "██████░░░░"
        elif score < 30:
            level, icon, meter = "HIGH RISK",      "🟠", "████████░░"
        else:
            level, icon, meter = "VERY HIGH RISK", "🔴", "██████████"

        return {
            "risk_score":      round(score, 2),
            "risk_level":      level,
            "risk_icon":       icon,
            "risk_meter":      meter,
            # Keep single suggestion for backward compat (top factor)
            "suggestion":      suggestions[0]["message"] if suggestions else "Maintain healthy habits.",
            # NEW: full ranked list
            "suggestions":     suggestions,
            "raw_model_score": round(raw_score, 2),
            "inputs":          data.dict()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": True}

print("Server ready. Waiting for requests...")
