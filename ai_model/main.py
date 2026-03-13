import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client['Aetherion_26']
collection = db['Patients']

@app.route('/')
def home():
    return jsonify({"status": "Aetherion Backend Live"}), 200

@app.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    print(f"🔍 Searching for ID: {user_id}")
    try:
        # Search for user_id OR userid
        user = collection.find_one({"$or": [{"user_id": user_id}, {"userid": user_id}]})
        
        if not user:
            print(f"❌ User {user_id} not found")
            return jsonify([]), 200
            
        logs = user.get('health_logs', [])
        formatted = []
        for log in reversed(logs):
            v = log.get('vitals', {})
            formatted.append({
                "date": log.get('timestamp', 'Recent'),
                "diagnosis": log.get('notes', 'AI Scan Result'),
                "severity": log.get('severity', 'normal'),
                "vitals": {
                    "hr": v.get('bpm', v.get('hr', 0)),
                    "spo2": v.get('spo2', 0),
                    "temp": v.get('temp', 36.5)
                }
            })
        print(f"✅ Found {len(formatted)} records")
        return jsonify(formatted), 200
    except Exception as e:
        print(f"🔥 Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)