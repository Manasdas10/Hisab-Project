# 💰 HISAB FINANCE TRACKER

A modern MERN Stack Personal Finance & Expense Tracker with beautiful UI, analytics, budgeting, reports, dark mode, and responsive design.

---

# 🚀 Features

✅ User Authentication  
✅ Login / Signup  
✅ JWT Authentication  
✅ Show / Hide Password  
✅ Add Income & Expenses  
✅ Dashboard Analytics  
✅ Monthly Budget Goal  
✅ Budget Planning  
✅ Reports & Insights  
✅ Category Charts  
✅ Dark / Light Theme  
✅ Responsive UI  
✅ Modern Design  

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- CSS3

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

# 📂 Project Structure

```bash
Hisab/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone <your-repository-link>
```

---

## 2️⃣ Open Project

```bash
cd Hisab
```

---

# 🖥️ Backend Setup

Go to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Install required packages:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken nodemon
```

---

# 🔐 Create .env File

Inside backend folder create:

```bash
.env
```

Add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=hisabsecret
PORT=3000
```

---

# ▶️ Run Backend

```bash
npm run dev
```

OR

```bash
node server.js
```

Expected Output:

```bash
Connected to MongoDB
Server running on port 3000
```

---

# 💻 Frontend Setup

Open NEW terminal.

Go to frontend folder:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Run Frontend

```bash
npm run dev
```

Expected Output:

```bash
Local: http://localhost:5173/
```

Open browser:

```bash
http://localhost:5173
```

---

# 🔑 Authentication Features

- User Signup
- User Login
- JWT Authentication
- Password Hide / Show
- Secure Password Encryption

---

# 📊 Dashboard Features

- Total Income
- Total Expense
- Remaining Balance
- Monthly Goal Tracker
- Budget Planning
- Expense Categories
- Doughnut Charts
- Income vs Expense Analytics
- Spending Insights

---

# 💸 Transaction Features

- Add Expense
- Add Income
- Select Category
- Add Notes
- Select Date
- Real-time Updates

---

# 📈 Reports Features

- Daily Spending Pattern
- Category Split
- Transaction Summary
- Spending Insights
- Monthly Analysis
- Range Filtering

---

# 🎨 Themes

## 🌞 Light Theme
- White background
- Purple gradient
- Soft shadows
- Clean UI

## 🌙 Dark Theme
- Black & Blue theme
- White text
- Dark cards
- Blue highlights

---

# ✨ Additional Upgrades Added

✅ Dark / Light Toggle  
✅ Doughnut Category Chart  
✅ Budget Goal Progress  
✅ Spending Insights  
✅ Better UI/UX  
✅ Responsive Layout  
✅ Animated Hover Effects  
✅ Improved Login Page  
✅ Show Password Option  
✅ Modern Dashboard Cards  

---

# 📄 Important Files

# Backend

## server.js
Starts backend server and connects MongoDB.

---

## authRoutes.js
Handles:
- Register
- Login
- JWT generation

---

## User.js
MongoDB schema for users.

---

# Frontend

## App.jsx
Main application routing and theme management.

---

## login.jsx
Login page with:
- Show Password
- Error handling
- Modern UI

---

## signup.jsx
Registration page.

---

## dashboard.jsx
Main dashboard with:
- Cards
- Analytics
- Charts
- Budget tracking

---

## addexpenses.jsx
Add new transactions.

---

## report.jsx
Analytics and reports section.

---

# 🐞 Common Errors & Fixes

# 1️⃣ Server Error on Login

## Cause:
Backend not running.

## Fix:

Run:

```bash
cd backend
npm run dev
```

---

# 2️⃣ MongoDB Connection Failed

## Cause:
Wrong MongoDB URI.

## Fix:

Check `.env`

```env
MONGO_URI=your_connection_string
```

---

# 3️⃣ Port Already In Use

## Fix:

Change port in `.env`

```env
PORT=5000
```

---

# 4️⃣ npm.ps1 Cannot Be Loaded

## Fix:

Run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy RemoteSigned
```

Then type:

```powershell
Y
```

---

# 5️⃣ Frontend Not Updating

## Fix:

Restart Vite server:

```bash
npm run dev
```

---

# 📱 Future Improvements

- CSV Export
- PDF Reports
- AI Spending Insights
- Notifications
- Savings Prediction
- Mobile App
- Voice Expense Entry

---

# 👨‍💻 Author

## Manas Das

MERN Stack Developer

---
