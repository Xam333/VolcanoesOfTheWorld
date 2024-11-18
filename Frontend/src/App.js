import './App.css';   // CSS file

// Import react components
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';

// Import local components
import Navbar from './components/Navbar';

// Import pages
import Home from './pages/Home';
import Volcanoes from './pages/Volcanoes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Volcano from './pages/Volcano';

function App() {
  // Log in use states
  const loggedInAtStart = localStorage.getItem("loggedIn");     // Get logged in state from local storage
  const [ loggedIn, setLoggedIn ] = useState(loggedInAtStart);  // Set logged in state

  // Log in function
  const login = () => {
    setLoggedIn(true);                      // Set logged in state to true
    localStorage.setItem("loggedIn", true); // Update local storage
  }
  // Log out function
  const logout = () => {
    setLoggedIn(false);                     // Set logged in state to false
    localStorage.removeItem("loggedIn");    // Clear logged in state in local storage
    localStorage.removeItem("token");       // Clear authentication token from local storage
  }

  // Return main body
  return (
    <BrowserRouter>
      <Navbar loggedIn={loggedIn} logout={logout}/>
      <Routes>
        <Route path="/" element={ <Home /> } />
        <Route path="/volcanoes" element={ <Volcanoes /> } />
        <Route path="/login" element={ <Login login={login}/> } />
        <Route path="/sign-up" element={ <Signup /> } />
        <Route path="/volcano" element={ <Volcano loggedIn={loggedIn}/> } />
      </Routes>
    </BrowserRouter>
  );
 }

export default App;
