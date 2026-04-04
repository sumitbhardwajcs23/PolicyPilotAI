# PolicyPilotAI (GigShield)

[![Status](https://img.shields.io/badge/Status-Development-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)]()
[![ML](https://img.shields.io/badge/ML-Python%20%7C%20FastAPI-yellow.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-blueviolet.svg)]()

**PolicyPilotAI** is a full-stack, AI-driven platform designed to provide automated income protection for gig workers. By leveraging machine learning and real-time data, we ensure that delivery partners and platform workers are protected against disruptions caused by extreme weather, platform failures, and other systemic risks.

---

## 🏗️ Project Structure

```
├── frontend/        # React (Vite) + TypeScript + Tailwind UI
├── backend/         # Node.js + Express (Deployed via Serverless on AWS Lambda)
├── ml_service/      # Python + Flask (Random Forest model on Render)
└── shared/          # Shared types and utility logic
```

---

## 🚀 Built With

### Frontend
- **React (Vite)** & **TypeScript**
- **Tailwind CSS** & **Radix UI** for high-quality, accessible components.
- **Framer Motion** & **GSAP** for premium micro-animations.
- **Zustand** for lightweight state management.
- **Recharts** & **Leaflet** for analytical dashboards and GPS mapping.

### Backend
- **Node.js (Express)** & **TypeScript**.
- **AWS Lambda** via **Serverless Framework** for cost-efficient scaling.
- **MongoDB (Mongoose)** for flexible data modeling.
- **Zod** for schema validation and type safety across boundaries.

### Intelligence (ML)
- **Python** & **Flask**.
- **Scikit-learn** Random Forest model for real-time fraud detection.
- **Render** for reliable containerized hosting.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.11+](https://www.python.org/)
- [Docker](https://www.docker.com/) (for ML service containerization)
- [Serverless Framework](https://www.serverless.com/) (`npm install -g serverless`)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/PolicyPilotAI.git
   cd PolicyPilotAI
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env with VITE_API_URL and VITE_ML_URL
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd ../backend
   npm install
   # Create .env with DATABASE_URL, JWT_SECRET, etc.
   npm run dev
   ```

4. **ML Service Setup**
   ```bash
   cd ../ml_service
   pip install -r requirements.txt
   python app.py
   ```

---

## 🌐 Deployment

### Frontend (Amplify/Vercel)
The frontend is optimized for deployment on **AWS Amplify** or **Vercel** with SPA routing support.

### Backend (AWS Lambda)
```bash
cd backend
serverless deploy
```

### ML Service (Render)
Pushes to the `ml_service` directory automatically trigger builds on Render via the `render.yaml` configuration.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

**All thanks To Hanuman Ji Maharaj**

---

## 📞 Contact
Project Link: [https://github.com/sumitbhardwajcs23/PolicyPilotAI](https://github.com/sumitbhardwajcs23/PolicyPilotAI)

Developed with ❤️ for the Global Gig Economy.
