import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# Ensure model directory exists
os.makedirs('ml-service/model', exist_ok=True)

# 1. Load Dataset
df = pd.read_csv('ml-service/data/study_data.csv')

# 2. Feature Engineering
# Add urgency = syllabusRemaining / daysLeft
df['urgency'] = df['syllabusRemaining'] / df['daysLeft']

# 3. Data Enhancement (Controlled Noise)
np.random.seed(42)

# Modify actualHours by ±5-10%
# actualHours * (1 + random between -0.1 and 0.1)
noise_hours = np.random.uniform(-0.1, 0.1, size=len(df))
df['actualHours'] = df['actualHours'] * (1 + noise_hours)
df['actualHours'] = df['actualHours'].clip(lower=0.1)

# Modify completion by ±5
noise_comp = np.random.uniform(-5, 5, size=len(df))
df['completion'] = df['completion'] + noise_comp
df['completion'] = df['completion'].clip(lower=60, upper=100)

# 4. Model Training
X = df[['difficulty', 'syllabusRemaining', 'daysLeft', 'urgency']]
y = df['actualHours']

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
print("Model saved to ml-service/model/study_model.pkl")
