import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/NoteModal.css";
import "../styles/notes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faMicrophone,
  faTrash,
  faExpand,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort notes: favorites first
  const sortedNotes = filteredNotes.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
  }, []);

  // Apply dark/light mode styles dynamically
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", isDarkMode); // Save preference
  }, [isDarkMode]);

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ No token found. Please log in.");
        navigate("/");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error("❌ Error fetching notes:", error.response || error);
      if (error.response?.status === 401) {
        alert("❌ Your session has expired. Redirecting to home page...");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert("❌ Cannot add an empty note!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Check if the token exists
      if (!token) {
        alert("❌ No token found. Please log in.");
        navigate("/"); // Redirect to root page
        return;
      }

      const formData = new FormData();
      formData.append("title", noteTitle || "Untitled Note");
      formData.append("content", newNote);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.post(
        "http://localhost:5000/api/notes",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes([...notes, response.data]); // Add the new note to the list
      setNewNote(""); // Clear the content field
      setNoteTitle(""); // Clear the title field
      setImageFile(null); // Clear the image file
    } catch (error) {
      console.error("❌ Error adding note:", error.response?.data || error);

      // Handle token expiration
      if (error.response?.status === 401) {
        alert("❌ Your session has expired. Redirecting to home page...");
        localStorage.removeItem("token"); // Remove the expired token
        navigate("/"); // Redirect to root page
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem("token");

      // Check if the token exists
      if (!token) {
        alert("❌ No token found. Please log in.");
        navigate("/"); // Redirect to root page
        return;
      }

      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(notes.filter((note) => note._id !== noteId)); // Remove the deleted note from the state
      setSelectedNote(null); // Close the modal
    } catch (error) {
      console.error("❌ Error deleting note:", error.response?.data || error);

      // Handle token expiration
      if (error.response?.status === 401) {
        alert("❌ Your session has expired. Redirecting to home page...");
        localStorage.removeItem("token"); // Remove the expired token
        navigate("/"); // Redirect to root page
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Speech Recognition is not supported in this browser.");
      setIsRecording(false);
      return;
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("❌ Microphone access is not supported in this browser.");
      setIsRecording(false);
      return;
    }

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        console.log("Microphone access granted");
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false; // Only final results
        recognition.maxAlternatives = 1; // Only one result

        recognition.start();

        recognition.onresult = (event) => {
          const speechText = event.results[0][0].transcript;
          if (selectedNote) {
            setSelectedNote({ ...selectedNote, content: speechText });
          } else {
            setNewNote(speechText);
          }
          setIsRecording(false);
        };

        recognition.onerror = (event) => {
          console.error("❌ Voice recognition error:", event.error);
          setIsRecording(false);
          alert(`❌ Error in speech recognition: ${event.error}`);
        };

        recognition.onend = () => {
          setIsRecording(false); // Ensure recording state is reset
        };
      })
      .catch((err) => {
        console.error("❌ Microphone access denied:", err);
        setIsRecording(false);
        alert("❌ Microphone access is required for speech recognition. Please enable it in your browser settings.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    navigate("/"); // Redirect to the login page
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ No token found. Please log in.");
        return;
      }
  
      const formData = new FormData();
      formData.append("title", selectedNote.title);
      formData.append("content", selectedNote.content);
      if (imageFile) {
        formData.append("image", imageFile); // Append the image file
      }
  
      const response = await axios.put(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Set the correct content type
          },
        }
      );
  
      if (response.status === 200) {
        // Clear the imageFile state after saving
        setImageFile(null);
  
        // Update the selectedNote with the new data (including the image URL)
        setSelectedNote(response.data);
  
        // Refresh the notes list
        fetchNotes();
  
        // Close the modal
        setSelectedNote(null);
      } else {
        alert("❌ Failed to update note.");
      }
    } catch (error) {
      console.error("❌ Error updating note:", error.response?.data || error);
      alert("❌ An error occurred while updating the note.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const toggleFavorite = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ No token found. Please log in.");
        return;
      }

      // Toggle the favorite status on the server
      const response = await axios.put(
        `http://localhost:5000/api/notes/${noteId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Update the note's favorite status in the state
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, favorite: !note.favorite } : note
          )
        );
      }
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);
    }
  };

  return (
    <div>
      {/* Header with Search Bar and Logout Button */}
      <div className="header">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        {/* Toggle Button */}
        <div className="toggle-container">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="toggle-button"
            style={{
              backgroundColor: isDarkMode ? "black" : "white",
            }}
          >
            {isDarkMode ? (
              <FontAwesomeIcon icon={faSun} style={{ color: "yellow" }} />
            ) : (
              <FontAwesomeIcon icon={faMoon} style={{ color: "black" }} />
            )}
          </button>
        </div>
      </div>

      <h1>Your Notes</h1>

      {/* Create Note Section */}
      <div className="note">
        <input
          type="text"
          placeholder="Note title..."
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAddNote();
            }
          }}
        />
        <button onClick={handleAddNote} className="btn-add">
          ➕
        </button>
        <button onClick={startRecording} className="btn-record">
          {isRecording ? "🎙 Recording..." : <FontAwesomeIcon icon={faMicrophone} />}
        </button>
      </div>

      {/* Display Notes or "Notes Not Found" Message */}
      {sortedNotes.length === 0 ? (
        <p className="no-notes-message">Notes not found.</p>
      ) : (
        <div className="notes-container">
          {sortedNotes.map((note) => (
            <div
              key={note._id}
              className="note-card"
              onClick={() => setSelectedNote(note)}
            >
              <h3>{note.title}</h3>
              <p>{note.content.substring(0, 50)}...</p>
              
              {/* Display the image if it exists */}
              {note.image && (
                <img
                  src={note.image} // Use the full Cloudinary URL directly
                  alt="Note attachment"
                  className="note-image"
                />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(note._id);
                }}
                className="favorite-button"
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{ color: note.favorite ? "yellow" : "white" }}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <div className="modal">
          <div className="modal-content">
            <div className="button-container">
              <button className="close-btn" onClick={() => setSelectedNote(null)}>
                Close
              </button>
              <button className="fullscreen-btn" onClick={toggleFullScreen}>
                <FontAwesomeIcon icon={faExpand} />
              </button>
            </div>
            <h2>Edit Note</h2>
            <input
              type="text"
              placeholder="Note title..."
              value={selectedNote.title}
              onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
            />
            <textarea
              placeholder="Note content"
              value={selectedNote.content}
              onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload"
            />
            <button onClick={handleSaveNote}>Save</button>
            <button onClick={startRecording}>
              {isRecording ? '🎙 Recording...' : <FontAwesomeIcon icon={faMicrophone} />} Record
            </button>
            <button
              onClick={() => handleDeleteNote(selectedNote._id)}
              className="delete-button"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(selectedNote._id);
              }}
              className="favorite-button"
            >
              <FontAwesomeIcon
                icon={faHeart}
                style={{ color: selectedNote.favorite ? "red" : "gray" }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;