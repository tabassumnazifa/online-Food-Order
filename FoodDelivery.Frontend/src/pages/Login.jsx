import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


function Login() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    setLoading(true);


    try {

      const response = await axios.post(
        "http://localhost:5079/api/Auth/login",
        formData
      );


      const token = response.data.token;


      // save token
      localStorage.setItem(
        "token",
        token
      );


      // decode JWT
      const decoded = jwtDecode(token);


      console.log(decoded);


      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];



      alert(`Welcome ${role}!`);



      // redirect based on role

      if(role === "Admin")
      {
        navigate("/admin/dashboard");
      }

      else if(role === "RestaurantOwner")
      {
        navigate("/restaurant/dashboard");
      }

      else if(role === "Rider")
      {
        navigate("/rider/dashboard");
      }

      else
      {
        navigate("/");
      }



    } 
    catch(error)
    {

      console.error(
        "Login Error:",
        error
      );


      alert(
        error.response?.data ||
        "Invalid email or password."
      );

    }


    finally
    {
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
Login to your account
</p>

</div>



<form
onSubmit={handleSubmit}
className="login-form"
autoComplete="off"
>


<label>
Email
</label>


<input

type="email"

name="email"

placeholder="Enter your email"

value={formData.email}

onChange={handleChange}

required

/>




<label>
Password
</label>


<input

type="password"

name="password"

placeholder="Enter your password"

value={formData.password}

onChange={handleChange}

required

/>




<button
type="submit"
disabled={loading}
>

{
loading
?
"Logging in..."
:
"Login"
}

</button>


</form>



<div className="login-footer">

<p>

Don't have an account?

<Link to="/register">
{" "}Create Account
</Link>

</p>

</div>



</div>


</div>

);


}


export default Login;