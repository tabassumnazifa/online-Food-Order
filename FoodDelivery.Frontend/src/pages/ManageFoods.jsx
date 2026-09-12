import { useEffect, useState } from "react";
import axios from "axios";

function ManageFoods() {
  const [foods, setFoods] = useState([]);
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
  });

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadRestaurantAndFoods();
  }, []);

  // ==========================================
  // LOAD RESTAURANT + FOODS
  // ==========================================

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

      setFoods(foodResponse.data || []);
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

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      isAvailable: true,
    });

    setEditingFoodId(null);
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (food) => {
    setEditingFoodId(food.id);

    setFormData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      isAvailable: food.isAvailable,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // ==========================================
  // ADD / UPDATE FOOD
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      alert("Restaurant information not available.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter a food name.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);

      const foodData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        isAvailable: formData.isAvailable,
        restaurantId: restaurantId,
      };

      if (editingFoodId) {
        await axios.put(
          `http://localhost:5079/api/Food/${editingFoodId}`,
          foodData,
          authConfig
        );

        alert("Food updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5079/api/Food/add",
          foodData,
          authConfig
        );

        alert("Food added successfully!");
      }

      closeForm();

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

  // ==========================================
  // DELETE FOOD
  // ==========================================

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

  // ==========================================
  // STATISTICS
  // ==========================================

  const availableCount = foods.filter(
    (food) => food.isAvailable
  ).length;

  const unavailableCount =
    foods.length - availableCount;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="manage-foods-page">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="manage-foods-header">
        <div>
          <span className="manage-foods-eyebrow">
            RESTAURANT MANAGEMENT
          </span>

          <h1>Manage Foods</h1>

          <p>
            Add, update and manage the food items
            available on your restaurant menu.
          </p>
        </div>

        <button
          type="button"
          className="add-food-btn"
          onClick={openAddForm}
        >
          <span>+</span>
          Add Food
        </button>
      </div>

      {/* ==========================================
          STATISTICS
      ========================================== */}

      {!loading && !error && (
        <div className="food-stats">

          {/* Total Foods */}
          <div className="food-stat-card">
            <div className="food-stat-icon green">
              🍽️
            </div>

            <div>
              <span>Total Foods</span>

              <strong>{foods.length}</strong>
            </div>
          </div>

          {/* Available */}
          <div className="food-stat-card">
            <div className="food-stat-icon orange">
              ✓
            </div>

            <div>
              <span>Available</span>

              <strong>{availableCount}</strong>
            </div>
          </div>

          {/* Unavailable */}
          <div className="food-stat-card">
            <div className="food-stat-icon gray">
              ◷
            </div>

            <div>
              <span>Unavailable</span>

              <strong>{unavailableCount}</strong>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          ADD / EDIT FORM
      ========================================== */}

      {showForm && (
        <div className="food-form-card">

          <div className="food-form-header">
            <div>
              <span className="form-eyebrow">
                {editingFoodId
                  ? "UPDATE MENU ITEM"
                  : "NEW MENU ITEM"}
              </span>

              <h2>
                {editingFoodId
                  ? "Edit Food"
                  : "Add New Food"}
              </h2>

              <p>
                {editingFoodId
                  ? "Update the information for this menu item."
                  : "Add a delicious new item to your restaurant menu."}
              </p>
            </div>

            <button
              type="button"
              className="form-close-btn"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form
            className="food-form"
            onSubmit={handleSubmit}
          >
            <div className="food-form-grid">

              {/* Food Name */}
              <div className="food-form-field">
                <label>
                  Food Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Chicken Biryani"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Price */}
              <div className="food-form-field">
                <label>
                  Price
                </label>

                <div className="price-input">
                  <span>৳</span>

                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="food-form-field food-availability-field">
                <label>
                  Availability
                </label>

                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                  />

                  <span className="toggle-slider"></span>

                  <span>
                    Available for customers
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="food-form-field full-width">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe the food item..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

            </div>

            {/* Form Actions */}
            <div className="food-form-actions">

              <button
                type="button"
                className="cancel-food-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-food-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingFoodId
                  ? "Update Food"
                  : "Add Food"}
              </button>

            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="foods-error">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to load foods
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={loadRestaurantAndFoods}
          >
            Retry
          </button>
        </div>
      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="foods-loading">
          <div className="loading-spinner"></div>

          <h3>
            Loading your menu...
          </h3>

          <p>
            Please wait while we fetch your food items.
          </p>
        </div>
      )}

      {/* ==========================================
          EMPTY STATE
      ========================================== */}

      {!loading &&
        !error &&
        foods.length === 0 && (
          <div className="foods-empty">

            <div className="empty-food-icon">
              🍽️
            </div>

            <span className="empty-eyebrow">
              YOUR MENU IS EMPTY
            </span>

            <h2>
              Let's add your first food item
            </h2>

            <p>
              Create your menu by adding delicious
              food items that customers can order.
            </p>

            <button
              type="button"
              className="add-food-btn empty-add-btn"
              onClick={openAddForm}
            >
              <span>+</span>
              Add Your First Food
            </button>

          </div>
        )}

      {/* ==========================================
          FOOD LIST
      ========================================== */}

      {!loading &&
        !error &&
        foods.length > 0 && (
          <section className="foods-section">

            <div className="foods-section-header">
              <div>
                <span className="section-eyebrow">
                  MENU ITEMS
                </span>

                <h2>
                  Your Food Menu
                </h2>
              </div>

              <span className="food-count-badge">
                {foods.length}{" "}
                {foods.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>

            <div className="food-list">

              {foods.map((food) => (
                <article
                  className="food-card"
                  key={food.id}
                >

                  {/* Food Image / Icon */}
                  <div className="food-card-image">

                    <span>🍴</span>

                    <div
                      className={
                        food.isAvailable
                          ? "food-status available"
                          : "food-status unavailable"
                      }
                    >
                      <span></span>

                      {food.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </div>

                  </div>

                  {/* Food Information */}
                  <div className="food-card-body">

                    <div className="food-card-top">
                      <span className="food-price">
                        ৳{food.price}
                      </span>
                    </div>

                    <h3>
                      {food.name}
                    </h3>

                    <p className="food-description">
                      {food.description ||
                        "No description available."}
                    </p>

                    <div className="food-card-footer">

                      <button
                        type="button"
                        className="edit-food-btn"
                        onClick={() =>
                          openEditForm(food)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="delete-food-btn"
                        onClick={() =>
                          handleDelete(food.id)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>
                </article>
              ))}

            </div>
          </section>
        )}

    </div>
  );
}

export default ManageFoods;
