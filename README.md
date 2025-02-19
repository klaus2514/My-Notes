# My-Notes 📒  

A simple and secure note-taking web application built with **React.js (Vite)** and **MongoDB Atlas**, featuring **JWT authentication**, **speech-to-text functionality**, and an intuitive **modal for note management**.  

## 🚀 Features  
✅ **User Authentication** – JWT-based signup & login.  
✅ **Create & Manage Notes** – Add, edit, rename, delete, and organize notes.  
✅ **Speech-to-Text** – Convert voice input into text using the Web Speech API.  
✅ **Real-time Search** – Search notes by title and content.  
✅ **Favorites & Sorting** – Mark notes as favorites and sort them easily.  
✅ **Copy to Clipboard** – Quickly copy note content.  
✅ **Dark Mode Toggle** – Switch between light and dark themes.  
✅ **Secure Data Handling** – MongoDB Atlas for cloud-based note storage.  

## 🛠️ Tech Stack  
- **Frontend:** React.js (Vite), CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **Authentication:** JWT (JSON Web Token)  
- **API Testing:** Hoppscotch  

## 📂 Project Structure  
My-Notes/ │── My-Notes/ # Vite React app
│ ├── src/ # Source files
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Main pages
│ │ ├── styles/ # CSS styles
│ │ ├── App.jsx # Main App component
│ │ ├── main.jsx # React root
│ ├── backend/ # Backend code
│ │ ├── models/ # MongoDB models
│ │ ├── routes/ # API routes (authRoutes.js, noteRoutes.js)
│ │ ├── server.js # Express server
│── package.json # Dependencies & scripts
│── README.md # Project documentation

bash
Copy
Edit

## ⚙️ Installation & Setup  
1. **Clone the repository**  
   ```sh
   git clone https://github.com/yourusername/My-Notes.git
   cd My-Notes
Install frontend dependencies

cd My-Notes
npm install
Install backend dependencies

cd backend
npm install
Set up environment variables

Create a .env file in the backend/ folder and add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=YOUR_CLODINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
CLOUDINARY_URL=YOUR_CLOUDINARY_URL

Run the backend server

cd backend
node server.js
Run the frontend

cd My-Notes
npm run dev
Open http://localhost:5173 in your browser. 🚀

🎥 Project Walkthrough
Check out this Loom video explaining the project! https://www.loom.com/share/62591dcd83cc4b51b568f2491dc418f4?sid=cf98e781-3400-40c4-b655-0cdc599e705e

🛡️ Security & Authentication
JWT tokens are used to protect user routes.
User sessions remain active until the token expires.
📌 Future Improvements
Add note sharing feature.
Implement reminder notifications for notes.
Enhance UI with more customization options.

