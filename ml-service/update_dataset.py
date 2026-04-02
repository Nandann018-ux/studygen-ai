import pandas as pd
import numpy as np
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv() # Check root
if not os.getenv('MONGO_URI'):
    # Check server directory
    server_env = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
    load_dotenv(server_env)

MONGO_URI = os.getenv('MONGO_URI')
CSV_PATH = os.path.join(os.path.dirname(__file__), 'data', 'study_data.csv')

def update_dataset():
    if not MONGO_URI:
        print("Error: MONGO_URI not found in .env")
        return

    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        
        # Collections
        sessions_col = db['studysessions']
        subjects_col = db['subjects']
        
        print("Fetching study sessions from MongoDB...")
        sessions = list(sessions_col.find())
        
        if not sessions:
            print("No study sessions found in database.")
            return

        new_rows = []
        for session in sessions:
            subject = subjects_col.find_one({"_id": session['subjectId']})
            if not subject:
                continue
                
            # Extract features
            difficulty = subject.get('difficulty', 3)
            syllabus_rem = subject.get('syllabusRemaining', 0)
            
            # Calculate daysLeft at time of session
            session_date = session.get('date', datetime.now())
            exam_date = subject.get('examDate')
            
            if exam_date:
                days_left = (exam_date - session_date).days
                days_left = max(1, days_left) # At least 1 day
            else:
                days_left = 30 # Default if no exam date
                
            actual_hours = session.get('actualHours', 0)
            
            new_rows.append({
                'difficulty': difficulty,
                'syllabusRemaining': syllabus_rem,
                'daysLeft': days_left,
                'actualHours': actual_hours,
                'is_real_data': 1 # Tag to distinguish from synthetic
            })
            
        if not new_rows:
            print("No valid session data to append.")
            return

        # Load existing data
        if os.path.exists(CSV_PATH):
            df_old = pd.read_csv(CSV_PATH)
        else:
            df_old = pd.DataFrame(columns=['difficulty', 'syllabusRemaining', 'daysLeft', 'actualHours'])

        df_new = pd.DataFrame(new_rows)
        
        # Combine and remove duplicates (if we want to be strict, but here we just append)
        # For now, let's just append but maybe we should avoid duplicating sessions.
        # We could use session ID as a key if we stored it.
        
        # For simplicity, we'll just overwrite with all sessions + synthetic base if it's small
        # The user said "Append to", but appending usually means adding new ones.
        
        # To avoid duplicates, let's just say we rebuild the "real data" part.
        base_synthetic = df_old[df_old.get('is_real_data', 0) == 0]
        
        df_final = pd.concat([base_synthetic, df_new], ignore_index=True)
        df_final.to_csv(CSV_PATH, index=False)
        
        print(f"Dataset updated successfully. Total rows: {len(df_final)} ({len(df_new)} real user sessions)")

    except Exception as e:
        print(f"Error updating dataset: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    update_dataset()
