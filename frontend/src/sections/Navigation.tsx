import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Zap } from 'lucide-react';

interface NavigationProps {
  scrollY: number;
}

const Navigation = ({ scrollY }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const isScrolled = scrollY > 100;

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Features', href: '#solution' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#testimonials' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-nav shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="gig-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className={`flex items-center gap-2 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#0a2d8d] to-[#f97316] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold font-['Poppins'] ${isScrolled ? 'text-[#0f172a]' : 'text-[#0f172a]'}`}>
              PolicyPilotAI
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isScrolled ? 'text-[#1e293b]' : 'text-[#1e293b]'
                } hover:text-[#0a2d8d] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#0a2d8d] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`hidden md:flex items-center gap-3 transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {/* AI Demo Badge Button */}
            <button
              onClick={() => navigate('/ml-demo')}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/90 to-cyan-600/90 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5" />
              AI Demo
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="gig-btn-primary"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#0f172a]" />
            ) : (
              <Menu className="w-6 h-6 text-[#0f172a]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="gig-container py-4 space-y-4">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="block py-2 text-[#64748b] hover:text-[#0a2d8d] font-medium transition-colors"
              style={{ 
                animation: isMobileMenuOpen ? `slideInUp 0.3s ease-out ${index * 50}ms forwards` : 'none',
                opacity: isMobileMenuOpen ? 1 : 0
              }}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => navigate('/ml-demo')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm mt-2"
          >
            <Zap className="w-4 h-4" />
            Try AI Demo
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="w-full gig-btn-primary mt-2"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
