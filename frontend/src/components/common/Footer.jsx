import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <h3 className="footer-title">SkillSet</h3>
          <p className="footer-description">
            Plateforme de recrutement moderne connectant talents et entreprises.
          </p>
          <div className="social-links">
            <a href="#facebook" aria-label="Facebook" className="social-icon">
              <Facebook size={20} />
            </a>
            <a href="#twitter" aria-label="Twitter" className="social-icon">
              <Twitter size={20} />
            </a>
            <a href="#linkedin" aria-label="LinkedIn" className="social-icon">
              <Linkedin size={20} />
            </a>
            <a href="#github" aria-label="GitHub" className="social-icon">
              <Github size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Liens Rapides</h4>
          <ul className="footer-links">
            <li><a href="/">Accueil</a></li>
            <li><a href="/jobs">Emplois</a></li>
            <li><a href="/candidates">Candidats</a></li>
            <li><a href="/about">À Propos</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Ressources</h4>
          <ul className="footer-links">
            <li><a href="/blog">Blog</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/help">Aide</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Contact</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={18} />
              <span>info@skillset.com</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+33 (0) 1 23 45 67 89</span>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Paris, France</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} SkillSet. Tous droits réservés.
          </p>
          <div className="footer-legal">
            <a href="/privacy">Politique de Confidentialité</a>
            <span className="separator">•</span>
            <a href="/terms">Conditions d'Utilisation</a>
            <span className="separator">•</span>
            <a href="/cookies">Gestion des Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
