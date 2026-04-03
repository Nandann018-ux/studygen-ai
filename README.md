# 🧠 StudyGen AI: Neural Study Optimization

StudyGen AI is a state-of-the-art study productivity platform that leverages machine learning to synthesize personalized, high-performance study paths. By analyzing cognitive load, subject difficulty, and historical performance, the platform "optimizes" your neural commitment to ensure maximum retention with minimum burnout.

---

## 🛠️ Technical Infrastructure

### Frontend Architecture
Built for sub-millisecond responsiveness and a premium, dark-themed aesthetic.
- **Core**: [React 19](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Visualizations**: [Chart.js](https://www.chartjs.org/) via `react-chartjs-2`
- **Iconography**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context + Hooks for real-time neural identity synchronization.

### ⚙️ Backend Engine
High-concurrency Node.js sanctuary for data persistence and ML coordination.
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Security**: JWT (JSON Web Tokens) for secure, stateless authentication.

### 🤖 ML & Analytics (Neural Laboratory)
A Python-driven intelligence layer that recalibrates your study trajectory based on real-world data.
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **Data Science**: [Scikit-learn](https://scikit-learn.org/), [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Models**:
  - **Commitment Allocator**: `RandomForestRegressor` (Estimates optimal focus blocks).
  - **Nueral Classifier**: `LogisticRegression` (Determines subject difficulty cohorts).
  - **Predictive Optimizer**: `LinearRegression` (Forecasts performance based on study density).
- **Core DL**: [PyTorch / Transformers](https://pytorch.org/) (Used for AI-generated study tips and semantic analysis).

### 📊 Dataset
The platform utilizes a structured dataset (`study_data.csv`) containing historical focus patterns and success metrics, which is continuously updated with your active study sessions to refine the local inference model.

---

## 🚀 Getting Started

1. **Environment Setup**:
   ```bash
   # In root
   npm install
   # In /server
   npm install
   # In /client
   npm install
   # In /ml-service
   pip install -r requirements.txt
   ```

2. **Launch Neural Infrastructure**:
   ```bash
   # Start Server (Port 5001)
   npm run dev:server
   
   # Start Frontend (Port 5173)
   npm run dev:client
   
   # Start ML Service (Port 5000)
   python ml-service/train.py && python ml-service/predict.py
   ```

---

## 🔬 Neural Principles
StudyGen AI adheres to several core cognitive principles:
- **Hebbian Learning**: Reinforcing subjects through iterative, high-focus blocks.
- **Progressive Overload**: Gradually increasing "Neural Load" as proficiency increases.
- **Delta Optimization**: Minimizing the gap between "Planned Commitment" and "Actual Intensity".