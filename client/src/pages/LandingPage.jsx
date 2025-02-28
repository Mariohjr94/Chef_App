import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryButtons from "../components/CategoryButtons"; 
import { Link } from "react-router-dom";
import AvatarSection from "../components/AvatarSetcion";
import { useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap"; 

function LandingPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [recipeCount, setRecipeCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');


// Modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

const fetchRecipes = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipes`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    setRecipes(response.data); 
    setFilteredRecipes(response.data);
    setRecipeCount(response.data.length)
    setLoading(false)
  } catch (error) {
    console.error("Failed to load recipes.", error);
  }
};

  // Initial fetch on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

 // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories.", error);
      setError("Failed to load categories");
    }
  };

  // Filter recipes when a category is clicked
  const handleCategoryClick = (categoryId) => {
    if (categoryId === null) {
      setFilteredRecipes(recipes); // Show all recipes if "All" is selected
    } else {
      const filtered = recipes.filter(recipe => recipe.category_id === categoryId);
      setFilteredRecipes(filtered);
    }
    setSelectedCategory(categoryId);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      // If the search bar is cleared, reset to show all recipes or the selected category
      handleCategoryClick(selectedCategory);
    } else {
      // Filter recipes based on the search term
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  };

  // Fetch full recipe details and open the modal
  const handleShowModal = async (recipeId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`
      );
      const data = response.data;

      // Parse ingredients and instructions (handle potential string format)
      const parsedIngredients = Array.isArray(data.ingredients)
        ? data.ingredients
        : JSON.parse(data.ingredients || "[]");

      const parsedInstructions = Array.isArray(data.instructions)
        ? data.instructions
        : JSON.parse(data.instructions || "[]");

      setSelectedRecipe({
        ...data,
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
      });

      setEditMode(false);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch recipe details.", error);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
     setEditMode(false);
  };

    const handleShowImageModal = () => {
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
  };

  // Handle saving edits
  const handleSaveChanges = async () => {
    if (!selectedRecipe) return;

    try {
      const updatedRecipe = {
        name: selectedRecipe.name,
        ingredients: JSON.stringify(selectedRecipe.ingredients),
        instructions: JSON.stringify(selectedRecipe.instructions),
        category_id: selectedRecipe.category_id,
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${selectedRecipe.id}`,
        updatedRecipe,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchRecipes(); // Refresh recipes after update
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update recipe:", error);
    }
  };

useEffect(() => {
  fetchRecipes();
  fetchCategories();
}, []);


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (error) return <p>{error}</p>;

   return (
    <div className="container mt-5">
    <AvatarSection
    user={user}
    recipeCount={recipeCount}/>
      <h1 className="text-center mb-5">Recipes</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search for recipes..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
<div>

{/* category buttons */}
<CategoryButtons 
  categories={categories}
  selectedCategory={selectedCategory} 
  onCategoryClick={handleCategoryClick}
  />
</div>



{/* Recipe Cards */}
<div className="row">
  {filteredRecipes.length > 0 ? (
    filteredRecipes.map((recipe) => (
      <div key={recipe.id} className="col-6 col-md-4 col-lg-3 mb-4">
        <div
          className="shadow-sm border-0 rounded h-80 recipe-card"
          onClick={() => handleShowModal(recipe.id)}
          style={{ cursor: "pointer" }}
                >
            <img src={recipe.image} className="card-img-top rounded-top" alt={recipe.name} />
            <div className="card-body d-flex align-items-center justify-content-center">
              <p className="card-title text-center m-0">{recipe.name}</p>
            </div>
        </div>
      </div>
          ))
        ) : (
          <p className="text-center">No recipes available.</p>
        )}
  </div>

          {/* Recipe Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedRecipe?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecipe && (
            <div className="text-center">
              {/* Clickable Image */}
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="img-fluid rounded mb-3"
                style={{ maxHeight: "300px", cursor: "pointer" }}
                onClick={handleShowImageModal}
              />

              <h4 className="text-secondary mt-4">Ingredients</h4>
              <ul className="list-group list-group-flush">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="list-group-item">
                    {ingredient}
                  </li>
                ))}
              </ul>

              <h4 className="text-danger mt-4">Instructions</h4>
              <ol className="list-group list-group-numbered">
                {selectedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="list-group-item">
                    {instruction}
                  </li>
                ))}
              </ol>

              {/* Edit Button (Only if logged in) */}
              {isLoggedIn && (
                <Button variant="warning" className="mt-3">
                  Edit Recipe
                </Button>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Full Image Modal */}
      <Modal show={showImageModal} onHide={handleCloseImageModal} centered>
        <Modal.Body className="text-center">
          {selectedRecipe && (
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="img-fluid rounded" />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LandingPage;