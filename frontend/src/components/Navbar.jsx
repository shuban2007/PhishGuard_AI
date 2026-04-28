import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Github, Menu, X } from 'lucide-react';

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const p = location.pathname;

  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto">
      <nav className="bg-[#0b1021]/60 backdrop-blur-xl backdrop-saturate-150 border border-white/5 text-slate-200 rounded-2xl shadow-2xl shadow-black/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <Shield className="w-8 h-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-slate-200 transition-colors">
                  <span className="italic">PhishGuard</span>{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" active={p === '/'}>Home</NavLink>
              <NavLink to="/scan-url" active={p === '/scan-url'}>Scan URL</NavLink>
              <NavLink to="/scan-message" active={p === '/scan-message'}>Scan Message</NavLink>
              <NavLink to="/terms" active={p === '/terms'}>Terms</NavLink>
              <NavLink to="/privacy" active={p === '/privacy'}>Privacy</NavLink>
              <a
                href="https://github.com/shrivastavanurag648/phishguard-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-3 py-2 rounded-md text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-4 pb-4 pt-2 flex flex-col gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/scan-url', label: 'Scan URL' },
              { to: '/scan-message', label: 'Scan Message' },
              { to: '/terms', label: 'Terms & Conditions' },
              { to: '/privacy', label: 'Privacy Policy' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  p === to ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://github.com/shrivastavanurag648/phishguard-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-md text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
