import './Account.css'  // Import CSS

// Import react components
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import local components
import Header from '../components/Header';

export default function Signup() {
  // Initialise use navigate
  const navigate = useNavigate();

  // Use states
  const [email, setEmail] = useState('');                 // Store username input
  const [password, setPassword] = useState('');           // Store password input
  const [passwordCheck, setPasswordCheck] = useState(''); // Store password check
  const [message, setMessage] = useState('Enter your details to sign up:');   // Message (error messages)
  const [isLoading, setIsLoading] = useState(false);      // Loading state

  // Handle response from API
  const handleResponse = (res) => {
    setIsLoading(false);
    setMessage(res.message || 'An error occurred during signup');
    if (!res.error) {
      navigate("/login");
    }
  };

  // Handle form submission
  const onFormSubmit = (e) => {
    e.preventDefault();

    if (password !== passwordCheck) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.trim() === '') {
      setMessage('Password is required');
      return;
    }

    setIsLoading(true);
    const url = `http://4.237.58.241:3000/user/register`;;

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


  return (
    <>
      <Header />
      <div className="account-container">
        <h1>Sign Up</h1>

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
            <input 
              type="password" 
              placeholder="Re-enter password..." 
              onChange={(e) => {
                setPasswordCheck(e.target.value);
              }}
            />
          </div>

          <button type="submit" disabled={isLoading}>
              SIGN UP
          </button>
        </form>
      </div>
    </>
  );
}