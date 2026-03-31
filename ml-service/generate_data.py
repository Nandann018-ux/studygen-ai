import pandas as pd
import numpy as np
import os
csv_path = 'data/study_data.csv'
if not os.path.exists('data'):
    os.makedirs('data')
print(f"Generating synthetic dataset dynamically at {csv_path}...")
np.random.seed(42)
n_samples = 1000
difficulty = np.random.randint(1, 6, n_samples)
syllabusRemaining = np.random.randint(0, 101, n_samples)
daysLeft = np.random.randint(1, 61, n_samples)
base_hours = 0.5
diff_factor = difficulty * 0.3
syl_factor = syllabusRemaining * 0.03
days_factor = np.where(
    daysLeft < 3, 3.0, 
    np.where(daysLeft < 7, 2.0, 
    np.where(daysLeft < 15, 1.2, 
    np.where(daysLeft < 30, 0.5, 0.1)))
)
target_hours = base_hours + diff_factor + syl_factor + days_factor
noise = np.random.normal(loc=0.0, scale=0.5, size=n_samples)
final_hours = np.clip(target_hours + noise, 0.5, 8.0)
df = pd.DataFrame({
    'difficulty': difficulty,
    'syllabusRemaining': syllabusRemaining,
    'daysLeft': daysLeft,
    'studyHours': np.round(final_hours, 1)
})
df.to_csv(csv_path, index=False)
print(f"Dataset generated with {n_samples} realistic rows and saved to {csv_path}")
