import os
sed -i '1s/^/import os\n/' app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load('health_risk_model.pkl')

# LabelEncoder alphabetical order mappings
# exercise: high=0, low=1, medium=2, none=3
EXERCISE_MAP = { 'high': 0, 'low': 1, 'medium': 2, 'none': 3 }

# sugar_intake: high=0, low=1, medium=2
SUGAR_MAP = { 'high': 0, 'low': 1, 'medium': 2 }

# profession: artist=0, doctor=1, driver=2, engineer=3, farmer=4, office_worker=5, student=6, teacher=7
PROFESSION_MAP = {
    'artist': 0, 'doctor': 1, 'driver': 2, 'engineer': 3,
    'farmer': 4, 'office_worker': 5, 'student': 6, 'teacher': 7
}

# health_risk after LabelEncoder: high=0, low=1
# So prediction=0 means HIGH risk, prediction=1 means LOW risk

def yes_no(val):
    if isinstance(val, bool):
        return 1 if val else 0
    return 1 if str(val).lower() in ['yes', 'true', '1'] else 0

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print('Received data:', data)

        profession_num = PROFESSION_MAP.get(str(data.get('profession', 'student')).lower(), 6)
        exercise_num = EXERCISE_MAP.get(str(data.get('exercise', 'medium')).lower(), 2)
        sugar_num = SUGAR_MAP.get(str(data.get('sugarIntake', 'medium')).lower(), 2)

        input_data = pd.DataFrame([{
            'age': int(data.get('age', 25)),
            'weight': float(data.get('weight', 70)),
            'height': float(data.get('height', 165)),
            'exercise': exercise_num,
            'sleep': float(data.get('sleep', 7)),
            'sugar_intake': sugar_num,
            'smoking': yes_no(data.get('smoking', False)),
            'alcohol': yes_no(data.get('alcohol', False)),
            'married': yes_no(data.get('married', False)),
            'profession': profession_num,
            'bmi': float(data.get('bmi', 25.0)),
        }])

        print('Input data:\n', input_data)

        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        # class 0 = high risk (bad), class 1 = low risk (good)
        high_risk_prob = round(probabilities[0] * 100, 1)
        low_risk_prob = round(probabilities[1] * 100, 1)

        print(f'Prediction: {prediction}, High risk prob: {high_risk_prob}%, Low risk prob: {low_risk_prob}%')

        if prediction == 1:  # low risk = good health
            if low_risk_prob > 70:
                status = 'Excellent Health'
                emoji = '💪'
                message = 'Your lifestyle is great! Keep it up.'
            else:
                status = 'Good Health'
                emoji = '😊'
                message = 'You are healthy. Minor improvements can help.'
        else:  # prediction == 0 = high risk
            if high_risk_prob > 75:
                status = 'Poor Health'
                emoji = '😰'
                message = 'High risk detected. Please consult a doctor soon.'
            else:
                status = 'At Risk'
                emoji = '⚠️'
                message = 'Moderate health risk. Improve lifestyle habits.'

        return jsonify({
            'prediction': int(prediction),
            'riskPercent': high_risk_prob,
            'status': status,
            'emoji': emoji,
            'message': message
        })

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)