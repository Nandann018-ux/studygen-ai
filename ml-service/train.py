import pandas as pd
import numpy as np
import os
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.preprocessing import StandardScaler
csv_path = 'data/study_data.csv'
if not os.path.exists(csv_path):
    print(f"Error: Dataset {csv_path} not found. Please run generate_data.py first.")
    exit(1)
print("Loading dataset...")
df = pd.read_csv(csv_path)
X = df[['difficulty', 'syllabusRemaining', 'daysLeft']]
y = df['studyHours']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Scaling input features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("Training RandomForestRegressor model...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)
preds = model.predict(X_test_scaled)
r2 = r2_score(y_test, preds)
print(f"Model Accuracy (R² Score): {r2:.4f}")
importances = model.feature_importances_
print("\nFeature Importances:")
for i, feature in enumerate(X.columns):
    print(f" - {feature}: {importances[i]:.4f}")
model_dir = 'model'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)
model_path = os.path.join(model_dir, 'model.pkl')
scaler_path = os.path.join(model_dir, 'scaler.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
print(f"\nModel securely saved to {model_path}")
with open(scaler_path, 'wb') as f:
    pickle.dump(scaler, f)
print(f"Scaler securely saved to {scaler_path}")
