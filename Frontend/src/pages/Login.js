import './Account.css'; // Import CSS

// Import react components
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

// Import local components
import Header from '../components/Header';

export default function Login({login}) {
  // Initialise use navigate
  const navigate = useNavigate();

  // Initialise use states
  const [email, setEmail] = useState('');         // Store email input
  const [password, setPassword] = useState('');   // Store password input
  const [message, setMessage] = useState('Enter your details to log in:');  // Store display message
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle response from API
  const handleResponse = (res) => {
    if (res.error === true) {
      setMessage(res.message);
    }
    else {
      setMessage("Logging in...")
      localStorage.setItem("token", res.token);
      login();
      navigate("/");  
    }
  }

  // Handle login form submission
  const onFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = `http://4.237.58.241:3000/user/login`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
    .then((res) => res.json())
    .then(handleResponse)
    .catch((error) => {
      setIsLoading(false);
      setMessage("An error occurred. Please try again.");
    });
  };

  // Return main login body
  return (
    <>
      <Header />
      <div className="account-container">
        <h1>Login</h1>

        <form onSubmit={onFormSubmit}>
          <div className="input-container">
            <p>{message}</p>
            <input 
              type="text" 
              placeholder="Enter email..." 
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <input 
              type="password" 
              placeholder="Enter password..." 
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            LOGIN
          </button>
        </form>
      </div>
    </>
  );
}