# StudyGen AI: Intelligent Study Optimization

StudyGen AI is an advanced productivity platform that utilizes machine learning to generate personalized study plans. By analyzing cognitive load, subject difficulty, and historical performance data, the application optimizes study schedules to enhance retention and productivity.

---

## Technical Infrastructure

### Frontend Architecture
The frontend is designed for high performance and responsiveness, utilizing a modern single-page application (SPA) architecture.
- **Framework**: [React 19](https://reactjs.org/) (built with Vite)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) via `react-chartjs-2`
- **Iconography**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API and custom hooks for synchronized user state and theme management.

### Backend Services
The backend is a Node.js-based REST API that facilitates data persistence and coordinates with the machine learning service.
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) for secure session management.

### Machine Learning and Analytics
A dedicated Python service provides the intelligence layer for predictive modeling and data analysis.
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **Libraries**: [Scikit-learn](https://scikit-learn.org/), [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Model Implementations**:
  - **Commitment Allocation**: `RandomForestRegressor` for estimating optimal study durations.
  - **Difficulty Classification**: `LogisticRegression` for categorizing subject complexity.
  - **Performance Forecasting**: `LinearRegression` for predicting exam outcomes based on study metrics.
- **Semantic Components**: [PyTorch](https://pytorch.org/) and [Transformers](https://huggingface.co/docs/transformers/) for automated study tip generation.

### Dataset Management
The application uses a structured dataset (`study_data.csv`) for initial model calibration. This dataset is dynamically updated with user-specific session data to continuously improve prediction accuracy.

---

## Installation and Setup

### 1. Environment Configuration
Install dependencies for each component of the architecture:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ../ml-service && pip install -r requirements.txt
```

### 2. Runtime Instructions
Execute the following commands to start the application components:
```bash
npm run dev:server
npm run dev:client
cd ml-service && python train.py && python predict.py
```

---

## Core Cognitive Principles
StudyGen AI's methodology is grounded in several academic and cognitive theories:
- **Spaced Repetition**: Iterative reinforcement through scheduled study blocks.
- **Load Balancing**: Managing cognitive demand to prevent burnout.
- **Predictive Analytics**: Using historical data to identify and mitigate learning gaps.