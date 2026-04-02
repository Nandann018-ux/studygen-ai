import pandas as pd
import numpy as np
import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables
load_dotenv() # Check root
if not os.getenv('MONGO_URI'):
    # Check server directory
    server_env = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
    load_dotenv(server_env)

MONGO_URI = os.getenv('MONGO_URI')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
CSV_PATH = os.path.join(DATA_DIR, 'study_data.csv')
SYNC_META_PATH = os.path.join(DATA_DIR, 'sync_meta.json')

def get_last_sync_time():
    if os.path.exists(SYNC_META_PATH):
        try:
            with open(SYNC_META_PATH, 'r') as f:
                return json.load(f).get('lastProcessedTimestamp', 0)
        except:
            return 0
    return 0

def save_sync_time(timestamp):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(SYNC_META_PATH, 'w') as f:
        json.dump({'lastProcessedTimestamp': timestamp}, f)

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
        
        last_sync = get_last_sync_time()
        print(f"Fetching updates since {datetime.fromtimestamp(last_sync/1000, tz=timezone.utc) if last_sync else 'beginning'}...")
        
        # 1. Fetch only new sessions
        new_sessions = list(sessions_col.find({"createdAt": {"$gt": datetime.fromtimestamp(last_sync/1000, tz=timezone.utc)}}))
        
        if not new_sessions:
            print("No new study sessions found.")
            return

        new_rows = []
        max_ts = last_sync

        for session in new_sessions:
            subject = subjects_col.find_one({"_id": session['subjectId']})
            if not subject:
                continue
                
            user_id = session['userId']
            subject_id = session['subjectId']
            
            # --- Advanced Feature Engineering ---
            
            # A. consistencyScore (Global user ratio)
            user_history = list(sessions_col.find({"userId": user_id, "createdAt": {"$lt": session['createdAt']}}))
            if user_history:
                total_planned = sum(s.get('plannedHours', 0) for s in user_history)
                total_actual = sum(s.get('actualHours', 0) for s in user_history)
                consistency_score = (total_actual / total_planned) if total_planned > 0 else 1.0
            else:
                consistency_score = 1.0 # Default for first session
                
            # B. pastAvgHours (Subject specific)
            subject_history = list(sessions_col.find({"userId": user_id, "subjectId": subject_id, "createdAt": {"$lt": session['createdAt']}}))
            if subject_history:
                past_avg_hours = sum(s.get('actualHours', 0) for s in subject_history) / len(subject_history)
            else:
                past_avg_hours = session.get('plannedHours', 2.0) # Fallback to current plan
            
            # --- Core Features ---
            difficulty = subject.get('difficulty', 3)
            syllabus_rem = subject.get('syllabusRemaining', 0)
            proficiency = subject.get('proficiency', 3)
            prev_score = subject.get('previousScore', 0)
            hours_per_day = subject.get('hoursPerDay', 2)
            rev_req = 1 if subject.get('revisionRequired', False) else 0
            
            # Calculate daysLeft at time of session
            session_date = session.get('date', datetime.now())
            exam_date = subject.get('examDate')
            
            if exam_date:
                # Ensure exam_date is datetime
                if isinstance(exam_date, str):
                    exam_date = datetime.fromisoformat(exam_date.replace('Z', '+00:00'))
                
                # Make session_date aware if it's naive to avoid comparison error
                if session_date.tzinfo is None:
                    session_date = session_date.replace(tzinfo=timezone.utc)
                if exam_date.tzinfo is None:
                    exam_date = exam_date.replace(tzinfo=timezone.utc)
                    
                days_left = (exam_date - session_date).days
                days_left = max(1, days_left)
            else:
                days_left = 30
                
            actual_hours = session.get('actualHours', 0)
            completion = session.get('completion', 0)
            
            new_rows.append({
                'difficulty': difficulty,
                'syllabusRemaining': syllabus_rem,
                'proficiency': proficiency,
                'previousScore': prev_score,
                'hoursPerDay': hours_per_day,
                'revisionRequired': rev_req,
                'daysLeft': days_left,
                'actualHours': actual_hours,
                'completion': completion,
                'consistencyScore': round(consistency_score, 2),
                'pastAvgHours': round(past_avg_hours, 1),
                'is_real_data': 1
            })
            
            # Update max timestamp tracker
            created_at_ts = int(session['createdAt'].replace(tzinfo=timezone.utc).timestamp() * 1000)
            if created_at_ts > max_ts:
                max_ts = created_at_ts
                
        if not new_rows:
            print("No valid new session data processed.")
            return

        # Load existing data
        if os.path.exists(CSV_PATH):
            df_old = pd.read_csv(CSV_PATH)
        else:
            df_old = pd.DataFrame(columns=['difficulty', 'syllabusRemaining', 'daysLeft', 'actualHours', 'completion', 'consistencyScore', 'pastAvgHours', 'is_real_data'])

        # Align columns
        df_new = pd.DataFrame(new_rows)
        for col in df_old.columns:
            if col not in df_new.columns:
                df_new[col] = 0
                
        df_final = pd.concat([df_old, df_new], ignore_index=True)
        df_final.to_csv(CSV_PATH, index=False)
        
        # 4. Save metadata
        save_sync_time(max_ts)
        
        print(f"Dataset updated successfully. Appended {len(new_rows)} new real sessions.")

    except Exception as e:
        print(f"Error updating dataset: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    update_dataset()
