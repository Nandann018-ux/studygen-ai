import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
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
    df['is_real_data'] = 0 # Default to synthetic if flag missing

real_count = len(df[df['is_real_data'] == 1])
syn_count = len(df[df['is_real_data'] == 0])
print(f"Data Distribution: {real_count} Real, {syn_count} Synthetic")

# 2. Feature Engineering
# Add urgency = syllabusRemaining / daysLeft (clip daysLeft to 1 to avoid /0)
df['urgency'] = df['syllabusRemaining'] / df['daysLeft'].clip(lower=1)

# 3. Data Enhancement (Controlled Noise - ONLY for synthetic data)
np.random.seed(42)

# Mask for synthetic data
synthetic_mask = df['is_real_data'] == 0

# Apply noise to actualHours for synthetic only
noise_hours = np.random.uniform(-0.1, 0.1, size=len(df))
df.loc[synthetic_mask, 'actualHours'] = df.loc[synthetic_mask, 'actualHours'] * (1 + noise_hours[synthetic_mask])
df['actualHours'] = df['actualHours'].clip(lower=0.1)

# Apply noise to completion for synthetic only (if completion exists)
if 'completion' in df.columns:
    noise_comp = np.random.uniform(-5, 5, size=len(df))
    df.loc[synthetic_mask, 'completion'] = df.loc[synthetic_mask, 'completion'] + noise_comp[synthetic_mask]
    df['completion'] = df['completion'].clip(lower=60, upper=100)

# 4. Model Training
X = df[['difficulty', 'syllabusRemaining', 'daysLeft', 'urgency']]
y = df['actualHours']

# If dataset is too small, skip retraining (Safety Check)
if len(df) < 10:
    print("Dataset too small (<10). Skipping retraining.")
    exit(0)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluation
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Training Score: {train_score:.4f}")
print(f"Test Score: {test_score:.4f}")

# 5. Save Model
joblib.dump(model, 'ml-service/model/study_model.pkl')
print("Model updated successfully as ml-service/model/study_model.pkl")
