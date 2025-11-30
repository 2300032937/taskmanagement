████████╗ █████╗ ███████╗██╗  ██╗     ███╗   ███╗ █████╗ ███╗   ██╗ █████╗ ████████╗███████╗███╗   ██╗
╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝     ████╗ ████║██╔══██╗████╗  ██║██╔══██╗╚══██╔══╝██╔════╝████╗  ██║
   ██║   ███████║███████╗█████╔╝      ██╔████╔██║███████║██╔██╗ ██║███████║   ██║   █████╗  ██╔██╗ ██║
   ██║   ██╔══██║╚════██║██╔═██╗      ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║   ██║   ██╔══╝  ██║╚██╗██║
   ██║   ██║  ██║███████║██║  ██╗     ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║   ██║   ███████╗██║ ╚████║
   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝     ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝




A full-stack Task Management web application built to help users efficiently create, manage, and track their daily tasks. The project includes authentication, task creation, progress tracking, and responsive UI.

🚀 Features
✔ User Authentication

Signup & Login

Secure password hashing

JWT-based authentication

✔ Task Management

Create new tasks

Update task status (Pending / In-Progress / Completed)

Edit or delete tasks

Assign due dates & priorities

✔ User Dashboard

View all tasks

Filter tasks by status or priority

Clean and responsive UI

✔ Backend API

REST APIs built with Node.js & Express

MongoDB database integration

Authentication middleware

✔ Frontend

React-based user interface

Clean design with reusable components

Real-time UI updates

🏗️ Tech Stack
Frontend

React.js

Axios

CSS / Tailwind / Material UI (your preference)

Backend

Node.js

Express.js

MongoDB (Mongoose ORM)

JWT Authentication

Tools

Git & GitHub

Postman

VS Code

📂 Folder Structure
taskmanagement/
│
├── client/               # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/               # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/2300032937/taskmanagement.git
cd taskmanagement

2️⃣ Install Backend Dependencies
cd server
npm install


Create a .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000


Run backend:

npm start

3️⃣ Install Frontend Dependencies
cd ../client
npm install
npm start

🚦 Running the Project

Backend runs on:

http://localhost:5000


Frontend runs on:

http://localhost:3000


Both must run simultaneously.

🛡️ Environment Variables (Important)

Create a .env file in server/:

MONGO_URI=
JWT_SECRET=
PORT=5000

🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.

📄 License

This project is licensed under the MIT License.

⭐ Support

If you like this project, give it a ⭐ on GitHub!
