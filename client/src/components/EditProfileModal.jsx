import React, { useState } from "react";
import axiosInstance from "../app/axiosInstancs";
import { useDispatch } from "react-redux";
import { updateUserProfile, useUpdateProfileMutation } from "../features/auth/authSlice";

const EditProfileModal = ({ open, handleClose, user }) => {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(null);
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  const [updateProfile] = useUpdateProfileMutation();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAvatar(URL.createObjectURL(selectedFile)); // Preview the image
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    if (file) {
      formData.append("avatar", file);
    }

    try {
      // Use RTK Query mutation to update the profile
      const updatedUser = await updateProfile(formData).unwrap();
      console.log("Profile updated successfully:", updatedUser);

      // Update Redux store with the updated user
      dispatch(updateUserProfile(updatedUser));

      handleClose(); // Close the modal
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className={`modal fade ${open ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title">Edit Profile</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body text-center">
            {/* Avatar Preview */}
            <img
              src={avatar || user?.avatar}
              alt="Avatar"
              className="rounded-circle border shadow-sm mb-3"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />

            {/* File Input */}
            <div
              className="border border-dashed p-3 mb-3 text-center"
              role="button"
              onClick={() => document.getElementById("avatarInput").click()}
            >
              {file ? file.name : user?.avatar ? "Replace Avatar" : "Click or Drag an Avatar Here"}
              <input
                id="avatarInput"
                type="file"
                className="form-control d-none"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            {/* Name Field */}
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Username Field */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
