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
    df['is_real_data'] = 0 

real_data = df[df['is_real_data'] == 1]
syn_data = df[df['is_real_data'] == 0]

print(f"--- Data Distribution ---")
print(f"Real Sessions: {len(real_data)}")
print(f"Synthetic Samples: {len(syn_data)}")
print(f"-------------------------")

# 2. Strategy: Prioritize real data
if len(real_data) >= 500:
    print("Strategy: Relying primarily on real user data (>500 samples).")
    train_df = real_data
else:
    print("Strategy: Using combined dataset (synthetic + real) for robustness.")
    train_df = df

# 3. Feature Engineering
# Features: 'difficulty', 'syllabusRemaining', 'daysLeft', 'urgency', 'consistencyScore', 'pastAvgHours'
train_df['urgency'] = train_df['syllabusRemaining'] / train_df['daysLeft'].clip(lower=1)

# Ensure new features exist
for col in ['consistencyScore', 'pastAvgHours']:
    if col not in train_df.columns:
        train_df[col] = 1.0 if col == 'consistencyScore' else 2.0

# 4. Data Enhancement (Only for synthetic data in combined mode)
np.random.seed(42)
synthetic_mask = train_df['is_real_data'] == 0

# Apply noise to synthetic actualHours
noise = np.random.uniform(-0.1, 0.1, size=len(train_df))
train_df.loc[synthetic_mask, 'actualHours'] = train_df.loc[synthetic_mask, 'actualHours'] * (1 + noise[synthetic_mask])
train_df['actualHours'] = train_df['actualHours'].clip(lower=0.1)

# 5. Model Training
features = ['difficulty', 'syllabusRemaining', 'daysLeft', 'urgency', 'consistencyScore', 'pastAvgHours']
X = train_df[features]
y = train_df['actualHours']

if len(train_df) < 10:
    print("Dataset too small. Skipping retraining.")
    exit(0)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluation
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Training R2 Score: {train_score:.4f}")
print(f"Test R2 Score: {test_score:.4f}")

# 6. Save Model
joblib.dump(model, 'ml-service/model/study_model.pkl')
print("Model updated successfully.")
