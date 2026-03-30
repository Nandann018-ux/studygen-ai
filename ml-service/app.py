import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model and scaler globally so they rest locally in memory
model_path = os.path.join('model', 'model.pkl')
scaler_path = os.path.join('model', 'scaler.pkl')

model = None
scaler = None

if os.path.exists(model_path) and os.path.exists(scaler_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Returns an ML-predicted amount of mapped base study hours.
    """
    # Safe handler providing reliable error states to the Node.js API
    if model is None or scaler is None:
        return jsonify({"error": "Model or Scaler not loaded natively. Please run train.py first."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body context"}), 400

    try:
        # Extract numerical features cleanly
        difficulty = float(data.get('difficulty', 3))
        syllabusRemaining = float(data.get('syllabusRemaining', 50))
        daysLeft = float(data.get('daysLeft', 10))

        # We construct a DataFrame securely so feature columns align linearly with our training shapes
        df_input = pd.DataFrame({
            'difficulty': [difficulty],
            'syllabusRemaining': [syllabusRemaining],
            'daysLeft': [daysLeft]
        })

        # Feature normalization
        # We transform the native inputs scaling them against the fitted training data distribution
        X_scaled = scaler.transform(df_input)

        # Output predictions leveraging the RandomForestRegressor
        prediction = model.predict(X_scaled)[0]

        # Enforce physical boundaries
        predicted_hours = max(0.5, round(prediction, 1))

        # Respond matching the identical JSON schema requested by Node 
        return jsonify({
            "studyHours": predicted_hours
        }), 200

    except ValueError:
        # Error encapsulation blocking string parsers and unhandled node exceptions natively
        return jsonify({"error": "Invalid input formatting boundaries. Provide strict integer coordinates."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize port execution linearly
    app.run(host='0.0.0.0', port=5000, debug=True)
