import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Settings, Bell, User, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-cherry-600 text-white font-bold text-sm rounded-lg flex items-center justify-center">
            S
          </div>
          <span className="text-lg font-bold text-gray-900">SkillSet</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <Home size={18} />
            <span className="text-sm font-medium">Accueil</span>
          </Link>

          <Link to="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <Settings size={18} />
            <span className="text-sm font-medium">Paramètres</span>
          </Link>

          <Link to="/notifications" className="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <Bell size={18} />
            <span className="text-sm font-medium">Notifications</span>
            <span className="absolute -top-2 -right-2 bg-cherry-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </Link>

          <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <User size={18} />
            <span className="text-sm font-medium">Profil</span>
          </Link>
        </div>

        {/* Right Section - Avatar + Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              alt="User Avatar"
              className="w-full h-full"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-3 flex flex-col">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>
              <Home size={18} />
              <span>Accueil</span>
            </Link>

            <Link to="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>
              <Settings size={18} />
              <span>Paramètres</span>
            </Link>

            <Link to="/notifications" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>
              <Bell size={18} />
              <span>Notifications</span>
            </Link>

            <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>
              <User size={18} />
              <span>Profil</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
