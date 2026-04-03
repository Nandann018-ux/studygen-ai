# StudyGen AI

### Intelligent Study Orchestration and Cognitive Analytics

StudyGen AI is a full-stack platform designed to optimize academic performance through heuristic-based study planning and real-time cognitive analytics. The system provides a centralized environment for students to manage intensive study schedules, track mastery across multiple subjects, and utilize data-driven insights to refine their learning process.

---

## Technical Overview

The application is built on a modern distributed architecture, integrating a high-performance React frontend with a scalable Node.js backend. It employs a custom heuristic engine to calculate optimal study distributions based on subject difficulty and user-defined cognitive thresholds.

---

## Core Features

### Neural Dashboard and Analytics
The dashboard serves as the central command center, providing real-time visualization of study progress. Using high-contrast data representations, it allows users to monitor their time allocation and subject mastery levels without distraction.

### Adaptive Study Planning
The integrated planning module generates dynamic daily schedules. It prioritizes subjects based on workload intensity and historical progress, ensuring that users focus on areas requiring the most cognitive attention.

### Integrated Focus Management
The platform includes a dedicated Focus Mode, implementing standard deep-work protocols to minimize context switching and maximize session efficiency.

### Cognitive Configuration
Users can define their specific learning constraints, including daily study limits and confidence thresholds, allowing the system to tailor its recommendations to individual performance baselines.

---

## Technology Stack

### Frontend
- React 19 (Vite)
- Tailwind CSS (Design System)
- Lucide React (Iconography)
- Recharts (Data Visualization)

### Backend
- Node.js and Express.js
- MongoDB (Data Persistence)
- JWT (Authentication and Security)
- Bcrypt.js (Credential Encryption)

---

## Directory Structure

- `client/`: React-based user interface and state management.
- `server/`: Express API services and database controllers.
- `ml-service/`: Heuristic logic and processing modules.
- `docs/`: Technical documentation and design guidelines.

---

## Installation and Deployment

### Backend Setup
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Configure environment variables in a `.env` file (JWT_SECRET, MONGODB_URI).
4. Start the development server: `npm run dev`

### Frontend Setup
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development environment: `npm run dev`

---

## Design Language

StudyGen AI utilizes a "Neural Laboratory" design language, characterized by a high-contrast Light Mode default, slate-based color palettes, and minimalist glassmorphism. The interface is engineered to reduce cognitive load while maintaining a premium, professional aesthetic.

---

## License
Distributed under the MIT License.