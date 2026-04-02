import sys
import json
import joblib
import pandas as pd
import os
import argparse

def get_args():
    parser = argparse.ArgumentParser(description='AI Study Planner Prediction Script')
    parser.add_argument('--task', type=str, choices=['hours', 'classify', 'score', 'tips'], required=True)
    parser.add_argument('--difficulty', type=float, default=3.0)
    parser.add_argument('--proficiency', type=float, default=3.0)
    parser.add_argument('--syllabus', type=float, default=0.0)
    parser.add_argument('--days', type=float, default=1.0)
    parser.add_argument('--consistency', type=float, default=0.8)
    parser.add_argument('--avgHours', type=float, default=2.0)
    parser.add_argument('--prevScore', type=float, default=60.0)
    parser.add_argument('--subject', type=str, default='the subject')
    return parser.parse_args()

def load_model(name):
    path = os.path.join(os.path.dirname(__file__), 'model', name)
    if os.path.exists(path):
        return joblib.load(path)
    return None

def main():
    try:
        args = get_args()
        
        # Feature Engineering (consistent with training)
        urgency = args.syllabus / args.days if args.days > 0 else args.syllabus
        
        # Prepare feature vector for models
        # features = ['difficulty', 'proficiency', 'syllabusRemaining', 'daysLeft', 'urgency', 'consistencyScore', 'pastAvgHours']
        df = pd.DataFrame([{
            'difficulty': args.difficulty,
            'proficiency': args.proficiency,
            'syllabusRemaining': args.syllabus,
            'daysLeft': args.days,
            'urgency': urgency,
            'consistencyScore': args.consistency,
            'pastAvgHours': args.avgHours
        }])

        result = {}

        if args.task == 'hours':
            model = load_model('study_model.pkl')
            if model:
                pred = model.predict(df)[0]
                result = {"predictedHours": float(round(pred, 1))}
            else:
                # Heuristic fallback
                comp_weight = (args.difficulty / 5) * 1.5 + 1
                result = {"predictedHours": float(round(comp_weight * (args.syllabus/20 + 1), 1))}

        elif args.task == 'classify':
            model = load_model('class_model.pkl')
            levels = ["Weak", "Medium", "Strong"]
            if model:
                pred = int(model.predict(df)[0])
                result = {"level": levels[pred]}
            else:
                diff = args.proficiency - args.difficulty
                level = "Weak" if diff <= -1 else ("Strong" if diff >= 1 else "Medium")
                result = {"level": level}

        elif args.task == 'score':
            model = load_model('score_model.pkl')
            if model:
                pred = score_model.predict(df)[0]
                result = {"predictedScore": float(round(pred, 1))}
            else:
                baseline = 70 + (args.proficiency - args.difficulty) * 5
                result = {"predictedScore": float(round(min(100, max(0, baseline)), 1))}

        elif args.task == 'tips':
            # Smart Heuristic Tips (High speed, diverse output)
            if args.difficulty >= 4:
                tips = [
                    f"Break {args.subject} into tight 25-minute Pomodoro sprints.",
                    "Heavily prioritize active recall on complex modules.",
                    "Create a visual mind-map for better knowledge retention."
                ]
            elif args.proficiency <= 2:
                tips = [
                    f"Start with {args.subject} fundamentals before diving deep.",
                    "Review recent lecture notes twice today.",
                    "Ask a peer to explain the most difficult topic in {args.subject}."
                ]
            else:
                tips = [
                    f"Maintain consistency in your {args.subject} study blocks.",
                    "Quickly skim today's syllabus to identify focus areas.",
                    "Solve at least 2 practice questions at the end of the session."
                ]
            result = {"tips": tips}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e), "fallback": True}))
        sys.exit(1)

if __name__ == '__main__':
    main()
