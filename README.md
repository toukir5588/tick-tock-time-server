# Tick Tock Time — Server

A real-time, scalable backend server for the **Tick Tock Time** application. This server handles user management, task tracking, timer synchronization, and real-time updates via WebSockets.

---

## 🚀 Features

* ⚡ **Real-time updates** with Socket.io
* 👤 **User Authentication & Authorization** (JWT based)
* 📊 **Task & Timer Management**
* 🗄️ **MongoDB Database Integration**
* 🔐 **Secure API structure**
* 📡 **REST API + WebSocket hybrid system**
* 🧩 **Modular, scalable architecture**

---

## 📁 Project Structure

```
/ src
  ├── controllers/     # API logic
  ├── models/          # Database schemas
  ├── routes/          # API endpoints
  ├── socket/          # Socket.io events
  ├── middlewares/     # Auth & other middleware
  ├── utils/           # Helper utilities
  ├── config/          # Environment & DB config
  └── server.js        # Main server file
```

---

## 🧰 Tech Stack

* **Node.js** — Backend runtime
* **Express.js** — Web server framework
* **MongoDB + Mongoose** — Database
* **Socket.io** — Real-time communication
* **JWT** — Authentication
* **Dotenv** — Environment variables

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/toukir5588/tick-tock-time-server.git
cd tick-tock-time-server
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Create environment file

Create a `.env` file in the project root:

```
PORT=5000
MONGO_URI=your-mongodb-url
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

---

## ▶️ Run the Server

### Development mode:

```
npm run dev
```

Using nodemon.

### Production mode:

```
npm start
```

Server will run at:

```
http://localhost:5000
```

---

## 🔗 API Overview

Some common endpoints:

### **Auth**

```
POST /api/auth/register
POST /api/auth/login
```

### **Tasks**

```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### **Timers (Real-time)**

* WebSocket event listeners
* Broadcast timer updates

---

## 🌐 Socket.io Events

```
connect
start-timer
pause-timer
reset-timer
task-updated
timer-sync
```

---

## 🤝 Contributing

Your contributions are always welcome! Feel free to open issues or PRs.

---

## 📜 License

This project is released under the **MIT License**.

---

### ✨ Author

Developed by **Toukir**

If this server helps you, star the repo! ⭐
