import React, { useState } from "react";
import "../styles/NoteModal.css";

const NoteModal = ({ note, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false);
  const [image, setImage] = useState(note.image || null);

  // Debugging: Log the note.image URL
  console.log("Note image URL:", note.image);

  const handleSave = () => {
    onUpdate({ ...note, _id: note._id, content: editedContent, isFavorite, image });
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note._id); // Call the onDelete function with the note ID
    }
  };

  return (
    <div className={`modal ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <button className="fullscreen-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button className="favorite-btn" onClick={() => setIsFavorite(!isFavorite)}>
          {isFavorite ? "★" : "☆"}
        </button>
        <button className="delete-btn" onClick={handleDelete}>🗑</button>

        {isEditing ? (
          <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
        ) : (
          <p>{note.content}</p>
        )}

        {note.audio && (
          <div className="audio-section">
            <audio controls src={note.audio}></audio>
            <p><strong>Transcript:</strong> {note.transcription || "No transcription available"}</p>
          </div>
        )}

        {image && <img src={typeof image === "string" ? image : URL.createObjectURL(image)} alt="Uploaded" className="note-image" />}

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {isEditing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
      </div>
    </div>
  );
};

export default NoteModal;