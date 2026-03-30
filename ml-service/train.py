import pandas as pd
import numpy as np
import os
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# 1. Dataset Generation Logic
csv_path = 'data/study_data.csv'
if not os.path.exists('data'):
    os.makedirs('data')

print(f"Generating synthetic dataset at {csv_path}...")
np.random.seed(42)
n_samples = 150

# Features
diff = np.random.randint(1, 6, n_samples)
syl = np.random.randint(0, 101, n_samples)
days = np.random.randint(1, 61, n_samples)

# Rule-based logic turned into synthetic data:
# Higher difficulty -> more hours
# Less daysLeft -> more hours
# More syllabusRemaining -> more hours
base_hours = 0.5
diff_factor = diff * 0.3
syl_factor = syl * 0.02
days_factor = np.where(days < 7, 1.5, np.where(days < 14, 1.0, 0.2))

hours = base_hours + diff_factor + syl_factor + days_factor

# Add tiny random noise to make it realistic 
noise = np.random.normal(0, 0.3, n_samples)
hours = np.clip(hours + noise, 0.5, 6.0)

df_new = pd.DataFrame({
    'difficulty': diff,
    'syllabusRemaining': syl,
    'daysLeft': days,
    'studyHours': np.round(hours, 1)
})

# Save to CSV
df_new.to_csv(csv_path, index=False)

# 2. Load Dataset
print("Loading dataset...")
df = pd.read_csv(csv_path)

# Features and Target
X = df[['difficulty', 'syllabusRemaining', 'daysLeft']]
y = df['studyHours']

# 3. Train Model
print("Training RandomForestRegressor model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
mse = mean_squared_error(y_test, preds)
print(f"Model MSE: {mse:.4f}")

# 4. Save model
model_dir = 'model'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

model_path = os.path.join(model_dir, 'study_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"Model saved to {model_path}")
