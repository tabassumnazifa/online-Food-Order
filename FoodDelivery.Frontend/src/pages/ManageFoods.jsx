import { useEffect, useState } from "react";
import axios from "axios";

function ManageFoods() {
  return (
    <div className="container">

      <h1>🍔 Manage Foods</h1>

      <button>
        + Add Food
      </button>

      <hr />

      <p>Food list will appear here...</p>

    </div>
  );
}

export default ManageFoods;