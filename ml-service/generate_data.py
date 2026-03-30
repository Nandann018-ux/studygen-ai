import pandas as pd
import numpy as np
import os

# Ensure the data directory exists
csv_path = 'data/study_data.csv'
if not os.path.exists('data'):
    os.makedirs('data')

print(f"Generating synthetic dataset dynamically at {csv_path}...")
np.random.seed(42)  # For reproducibility
n_samples = 1000

# 1. Feature Definition
# difficulty is typically scored 1 to 5
difficulty = np.random.randint(1, 6, n_samples)
# syllabusRemaining is a percentage 0 to 100
syllabusRemaining = np.random.randint(0, 101, n_samples)
# daysLeft is measured from 1 up to 60 days
daysLeft = np.random.randint(1, 61, n_samples)

# 2. Logic Construction for studyHours target
# - Higher difficulty -> more hours (scaled)
# - Higher syllabusRemaining -> more hours (scaled)
# - Lower daysLeft -> more hours (exponential proximity stress curve)

# Base hours assumed required even with all features at min thresholds
base_hours = 0.5

# Difficulty adds linear pressure up to ~1.5h
diff_factor = difficulty * 0.3

# Syllabus loads pressure up to ~3.0h
syl_factor = syllabusRemaining * 0.03

# Proximity stress creates an exponential threshold the closer the exam gets
days_factor = np.where(
    daysLeft < 3, 3.0, 
    np.where(daysLeft < 7, 2.0, 
    np.where(daysLeft < 15, 1.2, 
    np.where(daysLeft < 30, 0.5, 0.1)))
)

# 3. Target Assembly & Noise
# Summing linear and conditional deterministic components
target_hours = base_hours + diff_factor + syl_factor + days_factor

# Add random noise so the machine learning model has variance to learn through (more realistic!)
noise = np.random.normal(loc=0.0, scale=0.5, size=n_samples)

# Add noise and clip the target strictly so predictions remain physically plausible
final_hours = np.clip(target_hours + noise, 0.5, 8.0)

# Build the Dataframe matching the required schema
df = pd.DataFrame({
    'difficulty': difficulty,
    'syllabusRemaining': syllabusRemaining,
    'daysLeft': daysLeft,
    'studyHours': np.round(final_hours, 1) # Keep at single decimal interval like user schedules
})

# Save securely
df.to_csv(csv_path, index=False)
print(f"Dataset generated with {n_samples} realistic rows and saved to {csv_path}")
