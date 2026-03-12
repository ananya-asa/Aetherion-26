import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
uri = os.getenv("MONGO_URI")

def upload_data():
    client = MongoClient(uri)
    db = client['Aetherion_26']
    collection = db['Patients']
    
    # Path to your JSON file
    file_path = os.path.join(os.path.dirname(__file__), 'data.json')
    
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            
        collection.delete_many({}) # Clear old data
        if isinstance(data, list):
            collection.insert_many(data)
        else:
            collection.insert_one(data)
            
        print(f"✅ Success! {len(data) if isinstance(data, list) else 1} records uploaded.")
    except Exception as e:
        print(f"❌ Upload failed: {e}")

if __name__ == "__main__":
    upload_data()