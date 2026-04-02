import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Ensure model directory exists
os.makedirs('ml-service/model', exist_ok=True)

# 1. Load Dataset
CSV_PATH = 'ml-service/data/study_data.csv'
if not os.path.exists(CSV_PATH):
    print(f"Error: Dataset {CSV_PATH} not found.")
    exit(1)

df = pd.read_csv(CSV_PATH)

# Check for real vs synthetic data
if 'is_real_data' not in df.columns:
    df['is_real_data'] = 0 

# Ensure all spec-required columns exist (with fallback)
required_cols = {
    'proficiency': 3,
    'previousScore': 60,
    'hoursPerDay': 2,
    'revisionRequired': 0,
    'urgency': 1.0,
    'consistencyScore': 0.8,
    'pastAvgHours': 2.0
}

for col, default in required_cols.items():
    if col not in df.columns:
        df[col] = default

# Feature Engineering
df['urgency'] = df['syllabusRemaining'] / df['daysLeft'].clip(lower=1)

# --- 2. Training Models ---

# A. Study Hours Prediction (Random Forest Regressor)
features = ['difficulty', 'proficiency', 'syllabusRemaining', 'daysLeft', 'urgency', 'consistencyScore', 'pastAvgHours']
X = df[features]
y_hours = df['actualHours']

X_train, X_test, y_train, y_test = train_test_split(X, y_hours, test_size=0.2, random_state=42)
hours_model = RandomForestRegressor(n_estimators=100, random_state=42)
hours_model.fit(X_train, y_train)
joblib.dump(hours_model, 'ml-service/model/study_model.pkl')
print(f"✅ Study Hours Model trained. R2: {hours_model.score(X_test, y_test):.4f}")

# B. Subject Classification (Logistic Regression)
# Label: 0=Weak, 1=Medium, 2=Strong
# Heuristic for training label: Based on (Proficiency - Difficulty)
df['level_label'] = pd.cut(df['proficiency'] - df['difficulty'], 
                           bins=[-6, -1, 1, 6], 
                           labels=[0, 1, 2]).astype(int)

y_class = df['level_label']
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_class, test_size=0.2, random_state=42)
class_model = LogisticRegression(max_iter=1000)
class_model.fit(X_train_c, y_train_c)
joblib.dump(class_model, 'ml-service/model/class_model.pkl')
print(f"✅ Subject Classification Model trained. Acc: {class_model.score(X_test_c, y_test_c):.4f}")

# C. Exam Score Prediction (Linear Regression)
# Use 'completion' or generate target if missing
y_score = df['completion'] # Using completion as a proxy for predicted score
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X, y_score, test_size=0.2, random_state=42)
score_model = LinearRegression()
score_model.fit(X_train_s, y_train_s)
joblib.dump(score_model, 'ml-service/model/score_model.pkl')
print(f"✅ Exam Score Predictor trained. R2: {score_model.score(X_test_s, y_test_s):.4f}")

# D. Completion Prediction (Decision Tree Classifier)
# Target: 1 if actualHours >= plannedHours, else 0
if 'plannedHours' not in df.columns:
    df['plannedHours'] = 2.0
df['completed_on_time'] = (df['actualHours'] >= df['plannedHours']).astype(int)

y_comp = df['completed_on_time']
X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X, y_comp, test_size=0.2, random_state=42)
comp_model = DecisionTreeClassifier()
comp_model.fit(X_train_p, y_train_p)
joblib.dump(comp_model, 'ml-service/model/completion_model.pkl')
print(f"✅ Completion Probability Model trained. Acc: {comp_model.score(X_test_p, y_test_p):.4f}")

print("\n--- ALL MODELS UPDATED SUCCESSFULLY ---")
