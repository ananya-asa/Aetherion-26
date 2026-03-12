import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
uri = os.getenv("MONGO_URI")

def analyze_user_health(user_id):
    client = MongoClient(uri)
    db = client['Aetherion_26']
    collection = db['Patients']

    user = collection.find_one({"user_id": user_id})
    if not user:
        return f"Error: {user_id} not found."

    logs = user.get('health_logs', [])
    if len(logs) < 1:
        return "Error: No logs available."

    latest = logs[-1]
    prev = logs[-2] if len(logs) > 1 else latest
    
    spo2 = latest['vitals'].get('spo2', 100)
    bpm = latest['vitals'].get('bpm', 72)
    spo2_change = prev['vitals'].get('spo2', 100) - spo2
    
    risk_score = 0
    if spo2 < 95: risk_score += 50
    if spo2_change >= 2: risk_score += 30
    if bpm > 90: risk_score += 20

    status = "CRITICAL" if risk_score >= 70 else "MODERATE" if risk_score >= 30 else "STABLE"
    
    return f"""
    Patient: {user['name']}
    Status: {status} ({risk_score}/100)
    Vitals: SpO2 {spo2}% | BPM {bpm}
    Trend: SpO2 dropped by {spo2_change}%
    Alerts: {', '.join(latest['symptoms'])}
    """

if __name__ == "__main__":
    uid = input("Enter Patient ID: ").strip()
    print(analyze_user_health(uid))