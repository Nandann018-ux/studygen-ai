import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model globally so it exists in memory while app runs
model_path = os.path.join('model', 'study_model.pkl')

if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
else:
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    """
    Returns an ML-predicted amount of study hours given 
    difficulty, syllabusRemaining, and daysLeft.
    """
    if model is None:
        return jsonify({"error": "Model not found. Please run train.py first."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    try:
        # Extract features (defaulting if some are missing)
        difficulty = float(data.get('difficulty', 3))
        syllabusRemaining = float(data.get('syllabusRemaining', 50))
        daysLeft = float(data.get('daysLeft', 10))

        # We construct a DataFrame so feature names align with training structure
        df_input = pd.DataFrame({
            'difficulty': [difficulty],
            'syllabusRemaining': [syllabusRemaining],
            'daysLeft': [daysLeft]
        })

        # Run Prediction
        prediction = model.predict(df_input)[0]

        # Enforce minimum of 0.5 hours predicted natively just to be safe
        predicted_hours = max(0.5, round(prediction, 1))

        return jsonify({
            "studyHours": predicted_hours
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Run the Flask API on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
