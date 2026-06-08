import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Settings, Bell, User, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">SkillSet</span>
        </Link>

        {/* Hamburger Menu */}
        <button 
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <Home size={20} />
            <span>Accueil</span>
          </Link>
          
          <Link to="/settings" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <Settings size={20} />
            <span>Paramètres</span>
          </Link>
          
          <Link to="/notifications" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </Link>
          
          <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <User size={20} />
            <span>Profil</span>
          </Link>
        </div>

        {/* Right Section - User Avatar */}
        <div className="navbar-right">
          <div className="user-avatar">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
              alt="User Avatar"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
