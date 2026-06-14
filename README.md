# 👛 Hisab Finance

A modern full-stack personal finance management application built using the MERN stack. Hisab Finance helps users track income and expenses, manage budgets, analyze spending patterns, create savings goals, manage recurring transactions, and receive AI-powered financial insights.

---

## 🚀 Live Demo

### Frontend
https://hisab-finance.onrender.com

### Backend API
https://hisab-project.onrender.com

---

## 📌 Features

### Authentication
- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Session Management

### Transaction Management
- Add Income
- Add Expenses
- Edit Transactions
- Delete Transactions
- Transaction History
- Search Transactions

### Reports & Analytics
- Monthly Expense Reports
- Income vs Expense Analysis
- Spending Insights
- Category-wise Reports

### Budget Management
- Create Budget Goals
- Track Spending Progress
- Monitor Remaining Budget

### Categories
- Create Custom Categories
- Delete Categories
- Organize Expenses Efficiently

### Recurring Transactions
- Manage Repeated Expenses
- Automate Tracking Workflow

### AI Financial Advisor
- Personalized Financial Suggestions
- Spending Analysis
- Budget Recommendations

### User Experience
- Responsive Design
- Dark Mode Support
- Modern Dashboard UI
- Real-Time Updates

---

## 🏗️ System Architecture

```text
┌─────────────────────┐
│      User Browser   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   React + Vite UI   │
│ (Frontend Render)   │
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐
│ Express.js Backend  │
│ (Render Web Service)│
└──────────┬──────────┘
           │
     JWT Authentication
           │
           ▼
┌─────────────────────┐
│  MongoDB Atlas DB   │
└─────────────────────┘
```

---

## 🔄 Application Workflow

1. User registers an account.
2. Credentials are securely stored in MongoDB Atlas.
3. User logs in.
4. Backend validates credentials.
5. JWT token is generated.
6. Token is stored in browser localStorage.
7. All protected API requests include JWT.
8. Backend verifies JWT using middleware.
9. Data is fetched from MongoDB Atlas.
10. Dashboard updates in real time.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- CSS3
- Lucide React Icons

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose ODM

### Authentication
- JWT (JSON Web Tokens)
- bcryptjs

### Deployment
- Render
- MongoDB Atlas

### AI Integration
- OpenAI API

---

## 🔐 Authentication Flow

```text
User Login
     │
     ▼
Frontend
     │
POST /api/auth/login
     │
     ▼
Backend
     │
Verify Credentials
     │
Generate JWT
     ▼
Return Token
     │
Store in LocalStorage
     ▼
Protected API Calls
     │
Authorization: Bearer <token>
     ▼
JWT Middleware
     ▼
Access Granted
```

---

## 🌐 Deployment Architecture

```text
┌─────────────────────────┐
│ Frontend (Render Static)│
│ hisab-finance.onrender  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Backend (Render Service)│
│ hisab-project.onrender  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     MongoDB Atlas       │
│      Cluster0           │
└─────────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint |
|----------|------------|
| POST | /api/auth/register |
| POST | /api/auth/login |

### Transactions

| Method | Endpoint |
|----------|------------|
| GET | /api/transactions |
| POST | /api/transactions |
| PUT | /api/transactions/:id |
| DELETE | /api/transactions/:id |

### Categories

| Method | Endpoint |
|----------|------------|
| GET | /api/categories |
| POST | /api/categories |
| DELETE | /api/categories/:id |

### Goals

| Method | Endpoint |
|----------|------------|
| GET | /api/goals |
| POST | /api/goals |
| PUT | /api/goals/:id |
| DELETE | /api/goals/:id |

### AI Advisor

| Method | Endpoint |
|----------|------------|
| POST | /api/ai/chat |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Manasdas10/Hisab-Project.git
cd Hisab
```

### Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=3000
```

Run Backend:

```bash
npm start
```

---

### Frontend Setup

```bash
cd Frontend/hisab-frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=https://hisab-project.onrender.com
```

Run Frontend:

```bash
npm run dev
```

---

## 📁 Project Structure

```text
Hisab
│
├── backend
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── server.js
│
├── Frontend
│   └── hisab-frontend
│       ├── src
│       │   ├── pages
│       │   ├── components
│       │   ├── lib
│       │   └── assets
│       │
│       ├── public
│       └── App.jsx
│
└── README.md
```

---

## 🚀 Future Enhancements

- Email Verification
- Password Reset
- Google OAuth Login
- Multi-Currency Support
- Export Reports as PDF
- AI Expense Forecasting
- Mobile Application
- Investment Tracking
- Financial Health Score

---

## 📈 Resume Highlights

This project demonstrates:

- Full Stack MERN Development
- REST API Design
- JWT Authentication
- MongoDB Database Design
- Cloud Deployment
- CRUD Operations
- Secure User Authentication
- Financial Data Analytics
- AI Integration
- Responsive UI/UX Design
- State Management
- Production Deployment using Render

---

## 👨‍💻 Author

**Manas Das**

GitHub:
https://github.com/Manasdas10

LinkedIn:
https://www.linkedin.com/in/manas-das

---

---

⭐ If you found this project useful, please consider giving it a star on GitHub.
