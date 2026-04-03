# StudyGen AI – Intelligent Study Optimization

StudyGen AI is an AI-powered study planner that generates personalized schedules based on subject difficulty, deadlines, and user behavior. It continuously adapts using real-time data to improve productivity and learning efficiency.

---

## Key Features

- **Personalized Study Plans** – Generates optimized schedules using ML-based predictions  
- **Performance Analytics** – Tracks consistency, planned vs actual study time, and subject-wise insights  
- **Adaptive Learning System** – Improves recommendations using real user data (feedback loop)  
- **AI Explanations** – Provides reasoning behind study plan decisions  
- **Secure Authentication** – JWT-based login system  

---

## Tech Stack

### **Frontend**
- React(Vite)
- Tailwind CSS
- JavaScript

### **Backend**
- Node.js,Express
- MongoDB (Mongoose)
- JWT Authentication

### **DataSet**
- Self Generated Data


### **Machine Learning**
- Python (Scikit-learn)
- RandomForestRegressor for study hour prediction
- Real-time retraining using user session data

---

## How It Works

1. User adds subjects (difficulty, syllabus, deadlines)  
2. ML model predicts optimal study hours  
3. Study plan is generated dynamically  
4. User logs sessions → data stored  
5. Model retrains periodically using real data  

---

## Setup

```bash
# Install dependencies
npm install
cd server && npm install
cd client && npm install

# Start backend
npm run dev:server

# Start frontend
npm run dev:client

# ML service
cd ml-service
python train.py
