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

    # 2. Compute urgency feature (same as training)
    urgency = syllabusRemaining / daysLeft if daysLeft > 0 else syllabusRemaining

    # 3. Load model
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'study_model.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    model = joblib.load(model_path)

    # 4. Prepare input dataframe
    # Features need to match training: 'difficulty', 'syllabusRemaining', 'daysLeft', 'urgency'
    df = pd.DataFrame([{
        'difficulty': difficulty,
        'syllabusRemaining': syllabusRemaining,
        'daysLeft': daysLeft,
        'urgency': urgency
    }])

    # 5. Predict
    prediction = model.predict(df)[0]
    
    # 6. Clamp to realistic range
    prediction = max(0.5, float(round(prediction, 1)))

    # 7. Output strict JSON
    print(json.dumps({"predictedHours": prediction}))

except Exception as e:
    # Any internal errors will be caught and returned as JSON for safe parsing
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
