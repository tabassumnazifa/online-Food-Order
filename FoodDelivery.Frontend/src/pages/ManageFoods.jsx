import { useEffect, useState } from "react";
import axios from "axios";

function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const [restaurantId, setRestaurantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingFoodId, setEditingFoodId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    categoryId: "",
  });

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    loadRestaurantAndFoods();
    loadCategories();
  }, []);

  // ================================
  // LOAD RESTAURANT + FOODS
  // ================================

  const loadRestaurantAndFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const restaurantResponse = await axios.get(
        "http://localhost:5079/api/Restaurant/my-restaurant",
        authConfig
      );

      const id = restaurantResponse.data.id;

      setRestaurantId(id);

      const foodResponse = await axios.get(
        `http://localhost:5079/api/Food/restaurant/${id}`,
        authConfig
      );

      setFoods(foodResponse.data);
    } catch (error) {
      console.error("Food loading error:", error);

      setError(
        error.response?.data ||
          "Failed to load food items."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD CATEGORIES
  // ================================

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Category",
        authConfig
      );

      setCategories(response.data);
    } catch (error) {
      console.error("Category loading error:", error);
    }
  };

  // ================================
  // HANDLE INPUT
  // ================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ================================
  // OPEN ADD FORM
  // ================================

  const openAddForm = () => {
    setEditingFoodId(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      isAvailable: true,
      categoryId: "",
    });

    setShowForm(true);
  };

  // ================================
  // OPEN EDIT FORM
  // ================================

  const openEditForm = (food) => {
    setEditingFoodId(food.id);

    setFormData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      isAvailable: food.isAvailable,
      categoryId: food.categoryId || "",
    });

    setShowForm(true);
  };

  // ================================
  // ADD / UPDATE FOOD
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      alert("Restaurant information not available.");
      return;
    }

    if (!formData.categoryId) {
      alert("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const foodData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        isAvailable: formData.isAvailable,
        restaurantId: restaurantId,
        categoryId: Number(formData.categoryId),
      };

      if (editingFoodId) {
        // UPDATE
        await axios.put(
          `http://localhost:5079/api/Food/${editingFoodId}`,
          foodData,
          authConfig
        );

        alert("Food updated successfully!");
      } else {
        // ADD
        await axios.post(
          "http://localhost:5079/api/Food/add",
          foodData,
          authConfig
        );

        alert("Food added successfully!");
      }

      setShowForm(false);
      setEditingFoodId(null);

      setFormData({
        name: "",
        description: "",
        price: "",
        isAvailable: true,
        categoryId: "",
      });

      await loadRestaurantAndFoods();

    } catch (error) {
      console.error("Food save error:", error);

      alert(
        error.response?.data ||
          "Failed to save food."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // DELETE FOOD
  // ================================

  const handleDelete = async (foodId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5079/api/Food/${foodId}`,
        authConfig
      );

      alert("Food deleted successfully!");

      await loadRestaurantAndFoods();

    } catch (error) {
      console.error("Delete food error:", error);

      alert(
        error.response?.data ||
          "Failed to delete food."
      );
    }
  };

  return (
    <div className="container">

      {/* HEADER */}

      <div className="foods-header">

        <div>
          <h1>🍔 Manage Foods</h1>

          <p>
            Add and manage your restaurant's food items.
          </p>
        </div>

        <button onClick={openAddForm}>
          + Add Food
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="food-form-card">

          <h2>
            {editingFoodId
              ? "✏️ Edit Food"
              : "➕ Add New Food"}
          </h2>

          <form onSubmit={handleSubmit}>

            <label>
              Food Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter food name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Enter food description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label>
              Price
            </label>

            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              required
            />

            <label>
              Category
            </label>

            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

            <label className="availability-checkbox">

              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />

              Available for customers

            </label>

            <div className="form-actions">

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingFoodId
                  ? "Update Food"
                  : "Add Food"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <p>Loading food items...</p>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        foods.length === 0 && (
          <div className="empty-foods">

            <h2>🍽️ No Food Items Yet</h2>

            <p>
              Start adding food items to your restaurant menu.
            </p>

          </div>
        )}

      {/* FOOD LIST */}

      {!loading &&
        !error &&
        foods.length > 0 && (

          <div className="food-list">

            {foods.map((food) => (

              <div
                className="food-card"
                key={food.id}
              >

                <div className="food-card-header">

                  <h2>
                    {food.name}
                  </h2>

                  <span
                    className={
                      food.isAvailable
                        ? "available"
                        : "unavailable"
                    }
                  >
                    {food.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                <p className="food-description">
                  {food.description}
                </p>

                <div className="food-details">

                  <p>
                    💰 <strong>
                      ৳{food.price}
                    </strong>
                  </p>

                  <p>
                    📂 {food.categoryName}
                  </p>

                </div>

                <div className="food-actions">

                  <button
                    onClick={() => openEditForm(food)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(food.id)}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

export default ManageFoods;