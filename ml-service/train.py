import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# Create directories if they do not exist
os.makedirs('ml-service/model', exist_ok=True)

# 1. Load Data
df = pd.read_csv('ml-service/data/study_data.csv')

# 2. Data Enhancement
# Add new feature: urgency = syllabusRemaining / daysLeft
df['urgency'] = df['syllabusRemaining'] / df['daysLeft']

# Add slight randomness (noise)
# Modify actualHours by ±5-10%
hours_noise = np.random.uniform(-0.1, 0.1, size=len(df))
df['actualHours'] = df['actualHours'] * (1 + hours_noise)

# Modify completion slightly (±5)
comp_noise = np.random.uniform(-5, 5, size=len(df))
df['completion'] = df['completion'] + comp_noise

# Ensure boundaries
# actualHours stays positive
df['actualHours'] = df['actualHours'].clip(lower=0)
# completion stays between 60-100
df['completion'] = df['completion'].clip(lower=60, upper=100)

# Save the enhanced dataset (optional, but good practice)
# df.to_csv('ml-service/data/study_data_enhanced.csv', index=False)

# 3. Model Training
# Features (X) and Target (y)
X = df[['difficulty', 'syllabusRemaining', 'daysLeft', 'urgency']]
y = df['actualHours']

# Split dataset (train/test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Training Score:", model.score(X_train, y_train))
print("Test Score:", model.score(X_test, y_test))

# Save model
joblib.dump(model, 'ml-service/model/study_model.pkl')
print("Model saved successfully as ml-service/model/study_model.pkl")
