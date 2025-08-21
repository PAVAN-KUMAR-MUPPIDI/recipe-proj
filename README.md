# 🍲 Recipe Management App

A **MERN stack application** for managing recipes.  
Users can **add, update, delete, and view recipes** stored in MongoDB with a React frontend and Node.js/Express backend.  

---

## 🚀 Features
- Add, edit, delete, and view recipes
- MongoDB Atlas integration for persistent storage
- RESTful API with Express.js
- React (CRA) frontend with Axios for API calls
- Backend with Node.js, Express, and Mongoose
- Environment variable support using `dotenv`

---

## 📂 Project Structure

---

recipe-assessment/
│── backend/ # Express + MongoDB backend
│ ├── src/
│ │ ├── app.js
│ │ ├── server.js
│ │ ├── models/
│ │ ├── routes/
│ │ └── controllers/
│ ├── .env
│ ├── package.json
│
│── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── App.js
│ ├── package.json
│
└── README.md

---

---

## 🛠️ Tech Stack
- **Frontend:** React.js (CRA), Axios, Bootstrap/Tailwind (optional)
- **Backend:** Node.js, Express.js, Mongoose, dotenv, CORS
- **Database:** MongoDB Atlas (Cloud) / Local MongoDB

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/PAVAN-KUMAR-MUPPIDI/recipe-proj.git
cd recipe-assessment

cd backend

# Create .env file
echo "MONGO_URI=mongodb+srv://<username>:<password>@cluster1.yfx4emj.mongodb.net/recipeDB
PORT=5000
SECRET_KEY=your_secret_key" > .env

# Install dependencies
npm install

# Start server
npm run dev     # if using nodemon
# or
node src/server.js

cd ../client

# Install dependencies
npm install

# Start frontend
npm start


<h1>Author<h1>
<b>Pavan Kumar Muppidi<b>
