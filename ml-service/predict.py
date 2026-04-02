import sys
import json
import joblib
import pandas as pd
import os

try:
    # Read inputs
    difficulty = float(sys.argv[1])
    syllabusRemaining = float(sys.argv[2])
    daysLeft = float(sys.argv[3])

    # Compute urgency
    urgency = syllabusRemaining / daysLeft if daysLeft > 0 else syllabusRemaining

    # Load model
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'study_model.pkl')
    model = joblib.load(model_path)

    # Prepare input dataframe
    # Features need to match training: 'difficulty', 'syllabusRemaining', 'daysLeft', 'urgency'
    df = pd.DataFrame([{
        'difficulty': difficulty,
        'syllabusRemaining': syllabusRemaining,
        'daysLeft': daysLeft,
        'urgency': urgency
    }])

    # Predict
    predicted_hours = model.predict(df)[0]
    
    # Return realistic range
    predicted_hours = max(0.5, min(6.0, float(predicted_hours)))

    # Output JSON format
    print(json.dumps({'predicted_hours': predicted_hours}))

except Exception as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(1)
