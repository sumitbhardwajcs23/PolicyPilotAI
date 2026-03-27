import { useEffect, useRef, useState } from 'react';
import { Shield, Twitter, Linkedin, Facebook, Instagram, Send, Heart } from 'lucide-react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  const footerLinks = {
    product: [
      { name: 'Features', href: '#solution' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'API (for platforms)', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'IRDAI Disclosure', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer 
      ref={footerRef}
      className="bg-[#0f172a] text-white pt-20 pb-8"
    >
      <div className="gig-container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div 
            className={`lg:col-span-2 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Logo */}
            <a href="#hero" onClick={() => scrollToSection('#hero')} className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0a2d8d] to-[#f97316] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-['Poppins']">PolicyPilotAI</span>
            </a>

            <p className="text-gray-400 mb-6 max-w-sm">
              AI-powered protection for India's gig workers. Instant, affordable, trustworthy insurance.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Stay updated</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#f97316] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-lg bg-white/10 hover:bg-[#f97316] flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ transitionDelay: `${500 + index * 50}ms` }}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div 
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-gray-400 hover:text-white transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#f97316] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div 
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#f97316] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div 
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#f97316] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div 
            className={`flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <p className="text-gray-400 text-sm">
              © 2026 PolicyPilotAI. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Licensed by IRDAI | Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
