import sys
import json
import joblib
import pandas as pd
import os

try:
    # 1. Read input arguments
    difficulty = float(sys.argv[1])
    syllabusRemaining = float(sys.argv[2])
    daysLeft = float(sys.argv[3])
    consistencyScore = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    pastAvgHours = float(sys.argv[5]) if len(sys.argv) > 5 else 2.0

    # 2. Compute urgency feature (same as training)
    urgency = syllabusRemaining / daysLeft if daysLeft > 0 else syllabusRemaining

    # 3. Load model
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'study_model.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    model = joblib.load(model_path)

    # 4. Prepare input dataframe
    # Features MUST match training: ['difficulty', 'syllabusRemaining', 'daysLeft', 'urgency', 'consistencyScore', 'pastAvgHours']
    df = pd.DataFrame([{
        'difficulty': difficulty,
        'syllabusRemaining': syllabusRemaining,
        'daysLeft': daysLeft,
        'urgency': urgency,
        'consistencyScore': consistencyScore,
        'pastAvgHours': pastAvgHours
    }])

    # 5. Predict
    prediction = model.predict(df)[0]
    
    # 6. Clamp to realistic range
    prediction = max(0.5, float(round(prediction, 1)))

    # 7. Output strict JSON
    print(json.dumps({"predictedHours": prediction}))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
