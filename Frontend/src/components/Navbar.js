import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';

// CSS Styles
import './Navbar.css';

// Global navigation bar
export default function Navbar({loggedIn , logout}) {
  // Use states
  const [click, setClick] = useState(false);

  // Set functions
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          <Link to="/" className="navbar-logo">
            <i class="fa-solid fa-volcano"></i>
          </Link>

          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>

          <ul className={click ? 'nav-menu active' : 'nav-menu'}>

            <li className = 'nav-item'>
              <NavLink to="/" 
              className='nav-links' 
              onClick={closeMobileMenu}>
                HOME
              </NavLink>
            </li>

            <li className = 'nav-item'>
              <NavLink to="/volcanoes" 
              className='nav-links' 
              onClick={closeMobileMenu}>
                VOLCANOES
              </NavLink>
            </li>

            {loggedIn ? (
            <li className='nav-item'>
              <Link className='nav-links' onClick={() => { logout(); closeMobileMenu(); }}>
                LOGOUT
              </Link>
            </li>
          ) : (
            <>
              <li className='nav-item'>
                <NavLink to='/login' className='nav-links' onClick={closeMobileMenu}>
                  LOGIN
                </NavLink>
              </li>
              <li className='nav-item'>
                <NavLink to="/sign-up" className='nav-links' onClick={closeMobileMenu}>
                  SIGN UP
                </NavLink>
              </li>
            </>
          )}
            
          </ul>
        </div>
      </nav>
    </>
  );
}
