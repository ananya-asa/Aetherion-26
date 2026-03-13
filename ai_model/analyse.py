import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
uri = os.getenv("MONGO_URI")

def get_health_risk(user_id):
    client = MongoClient(uri)
    db = client['Aetherion_26']
    collection = db['Patients']

    # 1. Fetch the specific user
    user = collection.find_one({"user_id": user_id})
    
    if not user:
        return f"❌ User ID '{user_id}' not found in database."

    logs = user.get('health_logs', [])
    if not logs:
        return f"⚠️ No health logs found for {user.get('name')}."

    # 2. Extract Trend Data (comparing last 2 logs if available)
    latest = logs[-1]
    prev = logs[-2] if len(logs) > 1 else latest
    
    name = user.get('name')
    current_spo2 = latest['vitals'].get('spo2', 100)
    current_bpm = latest['vitals'].get('bpm', 72)
    
    # 3. Simple AI Logic: SpO2 Drop + BPM Rise = High Risk
    spo2_drop = prev['vitals'].get('spo2', 100) - current_spo2
    risk_score = 0
    
    if current_spo2 < 95: risk_score += 50
    if spo2_drop >= 2: risk_score += 30
    if current_bpm > 90: risk_score += 20

    # 4. Generate Output
    status = "CRITICAL" if risk_score >= 70 else "MODERATE" if risk_score >= 30 else "STABLE"
    
    report = f"""
    --- Health Risk Report: {name} ---
    Status: {status} (Risk Score: {risk_score}/100)
    Current SpO2: {current_spo2}% (Change: -{spo2_drop}%)
    Current Heart Rate: {current_bpm} BPM
    Symptoms: {', '.join(latest['symptoms'])}
    AI Recommendation: {'Seek immediate medical attention!' if status == 'CRITICAL' else 'Monitor symptoms and rest.'}
    """
    return report

if __name__ == "__main__":
    # The code asks for your input first
    target_id = input("Enter User ID (e.g., U123_Ananya) to analyze: ").strip()
    result = get_health_risk(target_id)
    print(result)