import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

function RecipeForm({ recipe = {}, onSave }) {
  const token = useSelector((state) => state.auth.token)
  const [name, setName] = useState(recipe.name || "");
  const [ingredients, setIngredients] = useState(recipe.ingredients || [""]);
  const [instructions, setInstructions] = useState(recipe.instructions ||[ ""]);
  const [categories, setCategories] = useState([]); 
  const [categoryId, setCategoryId] = useState(recipe.category_id || "");  
  const [image, setImage] = useState(null); 
  const navigate = useNavigate() 

  // Fetch categories from the backend when the component loads
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
      console.log("Received categories:", data);
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  fetchCategories();
}, []);
  
  

  // Handle ingredient input change for a specific index
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  // Add a new empty ingredient input field
  const addIngredientField = () => {
    setIngredients([...ingredients, ""]);
  };

  // Remove a specific ingredient input field
  const removeIngredientField = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  // Handle instruction input change for a specific index
  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };

  // Add a new empty instruction input field
  const addInstructionField = () => {
    setInstructions([...instructions, ""]);
  };

  // Remove a specific instruction input field
  const removeInstructionField = (index) => {
    const updatedInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(updatedInstructions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();  
    formData.append("name", name);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("instructions", JSON.stringify(instructions));
    formData.append("category_id", categoryId);

    if (image) {
      formData.append("image", image);  
    }

  // Log FormData
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

    try {
      if (!token) {
        console.error("No token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'  
      };

      if (recipe.id) {
        // If editing, update recipe
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipe.id}`, formData, { headers });
      } else {
        // If adding a new recipe
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/recipes`, formData, { headers });
      }
      
      if(onSave) {
        onSave(); 
      }
    
      navigate("/");

    } catch (error) {
      console.error("Failed to save the recipe:", error);
    }
  };

return (
  
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
          <h1 className="text-center  mb-5">Add Recipe</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">Recipe Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
        
            {/* Ingredients Section */}
            <div className="mb-3">
              <label className="form-label" htmlFor="ingredients">Ingredients</label>
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
            
        {/* Instructions Section */}
            <div className="mb-3">
              <label className="form-label" htmlFor="instructions">Instructions</label>
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

            {/* Category Dropdown */}
            <div className="mb-3">
              <label className="form-label" htmlFor="category">Category</label>
              <select
                className="form-select"
                id="category"
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

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label" htmlFor="image">Upload Image</label>
              <input
                type="file"
                className="form-control"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            

            {/* Submit Button */}
            <button type="submit" className="btn btn-dark">
              {recipe.id ? "Update" : "Add"} Recipe
            </button>
      </form>
      </div>
      
    </div>
  );
}

export default RecipeForm;