import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Wallet, ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const floatingCards = [
    { title: 'Rain Protection', amount: '₹450', delay: 0, position: 'top-20 right-10' },
    { title: 'Heat Cover', amount: '₹600', delay: 0.5, position: 'top-1/2 right-1/4' },
    { title: 'Pollution Shield', amount: '₹350', delay: 1, position: 'bottom-32 right-5' },
  ];

  const trustBadges = [
    { icon: Zap, text: 'Zero-touch claims' },
    { icon: Shield, text: '95% fraud protection' },
    { icon: Wallet, text: 'Instant UPI payouts' },
  ];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#0a2d8d]/5 to-[#3b82f6]/5 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#f97316]/5 to-[#fb923c]/5 blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 15}px, ${-mousePosition.y * 15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#0a2d8d 1px, transparent 1px), linear-gradient(90deg, #0a2d8d 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="gig-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-2">
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-['Poppins'] leading-tight transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <span className="text-[#0f172a]">AI-Powered</span>
              </h1>
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-['Poppins'] leading-tight transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '350ms' }}
              >
                <span className="text-[#0f172a]">Protection for</span>
              </h1>
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-['Poppins'] leading-tight transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '500ms' }}
              >
                <span className="gig-gradient-text">India's Gig Workers</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p 
              className={`text-lg text-[#64748b] max-w-lg transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '700ms' }}
            >
              Instant income protection against rain, heat, pollution & disruptions. 
              Starting at just <span className="text-[#f97316] font-semibold">₹49/week</span>.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '900ms' }}
            >
              <button 
                onClick={() => navigate('/login')}
                className="gig-btn-primary flex items-center gap-2 group"
              >
                Get Protected Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => scrollToSection('#how-it-works')}
                className="gig-btn-secondary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                See How It Works
              </button>
            </div>

            {/* Trust Badges */}
            <div 
              className={`flex flex-wrap gap-6 pt-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '1100ms' }}
            >
              {trustBadges.map((badge, index) => (
                <div 
                  key={badge.text}
                  className="flex items-center gap-2 text-sm text-[#64748b]"
                  style={{ animationDelay: `${(index + 11) * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#0a2d8d]/10 flex items-center justify-center">
                    <badge.icon className="w-4 h-4 text-[#0a2d8d]" />
                  </div>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Preview & Floating Cards */}
          <div className="relative hidden lg:block">
            {/* Dashboard Preview */}
            <div 
              className={`relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
              style={{ 
                transitionDelay: '600ms',
                perspective: '1200px',
              }}
            >
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50"
                style={{
                  transform: `perspective(1200px) rotateY(${-15 + mousePosition.x * 3}deg) rotateX(${5 + mousePosition.y * 3}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <img
                  src="/images/dashboard-preview.jpg"
                  alt="PolicyPilotAI Dashboard"
                  className="w-full h-auto"
                />
                {/* Glowing Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0a2d8d]/20 via-[#f97316]/20 to-[#0a2d8d]/20 animate-gradient-shift" 
                  style={{ backgroundSize: '200% 200%', mixBlendMode: 'overlay' }}
                />
              </div>
            </div>

            {/* Floating Cards */}
            {floatingCards.map((card, index) => (
              <div
                key={card.title}
                className={`absolute ${card.position} bg-white rounded-xl shadow-xl p-4 border border-gray-100 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-z-0' : 'opacity-0 translate-z-[-100px]'
                }`}
                style={{
                  transitionDelay: `${800 + index * 150}ms`,
                  animation: `float ${6 + index}s ease-in-out infinite`,
                  animationDelay: `${card.delay}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      index === 0 ? 'text-blue-600' : index === 1 ? 'text-orange-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">{card.title}</p>
                    <p className="text-lg font-bold text-[#0f172a]">{card.amount}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Live Indicator */}
            <div 
              className={`absolute bottom-10 left-10 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: '1200ms' }}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-[#0f172a]">Live Protection Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default Hero;
