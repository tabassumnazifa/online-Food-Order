import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [loading, setLoading] = useState(false);



  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    if (formData.password !== formData.confirmPassword) {

      alert("Passwords do not match.");

      return;

    }


    setLoading(true);


    try {

      await axios.post(
        "http://localhost:5079/api/Auth/register",
        formData
      );


      alert("Registration successful!");

      navigate("/login");


    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );


      alert(
        error.response?.data ||
        "Registration failed. Please try again."
      );


    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="login-page">


      <div className="login-card">


        <div className="login-header">

          <h1>
            🍔 Food Delivery
          </h1>

          <p>
            Create your account
          </p>

        </div>



        <form
          onSubmit={handleSubmit}
          className="login-form"
          autoComplete="off"
        >


          <label>
            Full Name
          </label>


          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />



          <label>
            Email
          </label>


          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />



          <label>
            Password
          </label>


          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />



          <label>
            Confirm Password
          </label>


          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />



          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
              ? "Creating Account..."
              : "Register"
            }

          </button>



        </form>



        <div className="login-footer">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>



      </div>


    </div>

  );

}


export default Register;