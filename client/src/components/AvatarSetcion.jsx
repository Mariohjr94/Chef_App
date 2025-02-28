import EditProfileModal from "./EditProfileModal";
import { useState } from "react";

const AvatarSection = ({ user, recipeCount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Open the modal
    const handleOpenModal = () => setIsModalOpen(true);
    // Close the modal
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="d-flex flex-column align-items-center py-4 pt-5 m-3">
            {/* Avatar */}
            <img
                src={user?.avatar}
                alt={user?.name}
                className="rounded-circle border shadow-sm"
                style={{ width: "100px", height: "100px", objectFit: "cover", marginBottom: "10px" }}
            />

            {/* User Info */}
            <h5 className="fw-bold">{user?.name}</h5>
            <p className="text-muted">@{user?.username}</p>

            {/* Recipe Count */}
            <p className="mb-2">{recipeCount} {recipeCount === 1 ? "Recipe" : "Recipes"} Uploaded</p>

            {/* Edit Profile Button */}
            <button className="btn btn-primary btn-sm mt-2" onClick={handleOpenModal}>
                Edit Profile
            </button>

            {/* Edit Profile Modal */}
            <EditProfileModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                user={user}
            />
        </div>
    );
};

export default AvatarSection;
