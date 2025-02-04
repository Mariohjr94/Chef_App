import React, { useRef, useState, useEffect } from "react";

const CategoryButtons = ({ categories, selectedCategory, onCategoryClick }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle horizontal scroll on mouse wheel
  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      const handleWheel = (event) => {
        if (containerRef.current) {
          event.preventDefault();
          containerRef.current.scrollLeft += event.deltaY; // Scroll horizontally
        }
      };

      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  // Handle mouse down event
  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartX(event.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  // Handle mouse move event
  const handleMouseMove = (event) => {
    if (!isDragging) return;
    event.preventDefault();
    const x = event.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="d-flex overflow-auto p-3 gap-2 category-buttons"
      style={{
        whiteSpace: "nowrap",
        scrollbarWidth: "none", 
      }}
    >
      {/* "All" Button */}
      <button
        className={`btn ${selectedCategory === null ? "btn-primary" : "btn-outline-secondary"}`}
        onClick={() => onCategoryClick(null)}
      >
        All
      </button>

      {/* Dynamic Category Buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          className={`btn ${selectedCategory === category.id ? "btn-primary" : "btn-light"}`}
          onClick={() => onCategoryClick(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryButtons;
