import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false); 
  const [categories, setCategories] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const isLoggedIn = !!token; 
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [image, setImage] = useState(null);
  const [categoryId, setCategoryId] = useState("");

useEffect(() => {
  const fetchRecipe = async () => {
    try {
      console.log("Fetching recipe with ID:", id);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`
      );

      if (!response || !response.data) {
        throw new Error("No data found in response.");
      }

      const data = response.data;
      console.log("API Response Data:", data);

      const parsedIngredients = Array.isArray(data.ingredients)
        ? data.ingredients
        : JSON.parse(data.ingredients || "[]");

      const parsedInstructions = Array.isArray(data.instructions)
        ? data.instructions
        : JSON.parse(data.instructions || "[]");

      console.log("Parsed Ingredients:", parsedIngredients);
      console.log("Parsed Instructions:", parsedInstructions);

      setRecipe({
        ...data,
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
      });

      setName(data.name);
      setIngredients(parsedIngredients);
      setInstructions(parsedInstructions);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch recipe:", err);
      setError("Failed to load recipe.");
      setLoading(false);
    }
  };

  fetchRecipe();
}, [id]);



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredientField = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };

  const addInstructionField = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstructionField = (index) => {
    const updatedInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(updatedInstructions);
  };

  const handleSave = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }
      formData.append("name", name);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("instructions", JSON.stringify(instructions));
      formData.append("category_id", categoryId || recipe.category_id);

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`,
        formData,
        { headers }
      );

    // Fetch the updated recipe from the server
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`
    );

      setEditMode(false);
      setRecipe(response.data)
    } catch (err) {
      console.error("Failed to update recipe:", err);
    }
  };

  const handleDelete = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` };

    await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`,
      { headers }
    );

    // Redirect to another page (e.g., the recipe list page)
    navigate("/")
  } catch (err) {
    console.error("Failed to delete recipe:", err);
  }
};


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

  const handleImageClick = () => {
  setShowImageModal(true);
};

const handleCloseModal = () => {
  setShowImageModal(false);
};


 return (
    <div className="container mt-5">
      {!editMode ? (
        <div className="card shadow-lg">
           {/* Card Header */}
          <div className="card-header bg-light text-black text-center">
            <h2 className="card-title mb-0">{recipe.name}</h2>
          </div>
          <div className="card-body">
            <div className="row">
              {/* image */}
              <div className="col-md-6 d-flex align-items-center mt-4 mb-4">
                <div className="text-center">
                  <img
                    className="img-fluid rounded"
                    data-toggle="modal" 
                    style={{ maxWidth: "60%", cursor: "pointer" }}
                    src={recipe?.image}
                    alt={recipe?.name || "Recipe image"}
                    onClick={handleImageClick}
                  />
                </div>
              </div>

              {/* Right Column: Ingredients and Instructions */}
              <div className="col-md-6">
                <div className="mb-4">
                  <h4 className="text-secondary mt-4">Ingredients</h4>
                  {recipe && recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="list-group-item">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No ingredients provided.</p>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-danger">Instructions</h4>
                  {recipe && recipe.instructions && recipe.instructions.length > 0 ? (
                    <ol className="list-group list-group-numbered">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="list-group-item">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No instructions provided.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer text-center">
            {isLoggedIn && (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setEditMode(true)}
              >
                Edit Recipe
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="card p-4">
            <h1 className="text-center mb-5">Edit Recipe</h1>
            <div className="mb-3">
              <label className="form-label">Recipe Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ingredients</label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeIngredientField(index)}
                    disabled={ingredients.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={addIngredientField}
              >
                Add Ingredient
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Instructions</label>
              {instructions.map((instruction, index) => (
                <div key={index} className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeInstructionField(index)}
                    disabled={instructions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={addInstructionField}
              >
                Add Instruction
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-success" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Recipe
              </button>
             <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
  Cancel
</button>
            </div>
          </div>
        </div>
      )}
      {/* Bootstrap Modal - Place this after the main content */}
      {showImageModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{recipe.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetails;