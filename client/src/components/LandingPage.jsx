import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function LandingPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');

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
    setLoading(false)
  } catch (error) {
    console.error("Failed to load recipes.", error);
  }
};

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

     {/* Category Buttons */}
<div className="mb-5 text-center category-buttons">
  <button
    className={`btn btn-dark mx-1 ${selectedCategory === null ? 'active' : ''}`}
    onClick={() => handleCategoryClick(null)}
  >
    All
  </button>
  {categories.map((category) => (
    <button
      key={category.id}
      className={`btn btn-warning mx-1 ${selectedCategory === category.id ? 'active' : ''}`}
      onClick={() => handleCategoryClick(category.id)}
    >
      {category.name}
    </button>
  ))}
</div>

{/* Recipe Cards */}
<div className="row">
  {filteredRecipes.length > 0 ? (
    filteredRecipes.map((recipe) => (
      <div key={recipe.id} className="col-6 col-md-4 col-lg-3 mb-4">
        <Link to={`/recipe/${recipe.id}`} className="text-decoration-none text-dark">
          <div className="shadow-sm border-0 rounded h-80">
            <img src={recipe.image} className="card-img-top rounded-top" alt={recipe.name} />
            <div className="card-body d-flex align-items-center justify-content-center">
              <p className="card-title text-center m-0">{recipe.name}</p>
            </div>
          </div>
        </Link>
      </div>
    ))
  ) : (
    <p className="text-center">No recipes available.</p>
  )}
</div>

</div>
  );
}

export default LandingPage;
