import { useEffect, useRef, useState } from 'react';
import { Brain, Zap, ShieldCheck, Wallet } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
  isVisible: boolean;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay, isVisible, index }: FeatureCardProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientY - rect.top - rect.height / 2) / 20;
      const y = (rect.width / 2 - (e.clientX - rect.left)) / 20;
      setRotation({ x: Math.max(-8, Math.min(8, x)), y: Math.max(-8, Math.min(8, y)) });
    }
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`gig-card p-8 relative overflow-hidden group cursor-pointer transition-all duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: isVisible 
          ? `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(${rotation.x !== 0 || rotation.y !== 0 ? 30 : 0}px)`
          : `perspective(800px) rotateY(${index % 2 === 0 ? 90 : -90}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2d8d]/5 to-[#f97316]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0a2d8d] to-[#1e3a8a] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="w-7 h-7 text-white" />
        </div>
        {/* Icon Glow */}
        <div className="absolute inset-0 w-14 h-14 rounded-xl bg-[#0a2d8d]/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <h3 className="relative text-xl font-bold text-[#0f172a] mb-3 font-['Poppins']">
        {title}
      </h3>
      <p className="relative text-[#64748b] leading-relaxed">
        {description}
      </p>

      {/* Corner Accent */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-[#f97316]/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

const Solution = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Risk Assessment',
      description: 'Dynamic premiums based on your location, season, and work patterns. Fair pricing that adapts to your risk profile.',
    },
    {
      icon: Zap,
      title: 'Zero-Touch Claims',
      description: 'No paperwork, no waiting. Our system automatically detects disruptions and triggers payouts in 8-12 minutes.',
    },
    {
      icon: ShieldCheck,
      title: 'Fraud Protection',
      description: '95%+ accuracy in fraud detection using GPS, weather data, and behavioral analysis. Your premiums stay low.',
    },
    {
      icon: Wallet,
      title: 'Instant UPI Payouts',
      description: 'Money directly to your UPI ID within minutes of claim approval. No bank visits, no delays.',
    },
  ];

  return (
    <section 
      id="solution" 
      ref={sectionRef}
      className="py-24 bg-[#f8fafc] relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#0a2d8d]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#f97316]/5 rounded-full blur-3xl" />

      {/* Connecting Lines SVG */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
        style={{ opacity: isVisible ? 0.3 : 0, transition: 'opacity 1s ease-out 0.8s' }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a2d8d" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <path
          d="M 400 200 Q 600 300 400 400"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="8 4"
          className={`transition-all duration-1500 ${isVisible ? 'stroke-dashoffset-0' : ''}`}
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: isVisible ? 0 : 1000,
            transition: 'stroke-dashoffset 1.5s ease-out 0.8s',
          }}
        />
      </svg>

      <div className="gig-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className={`section-label transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Our Solution
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] mt-4 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            PolicyPilotAI: <span className="gig-gradient-text">AI-Powered</span> Parametric Insurance
          </h2>
          <p 
            className={`text-lg text-[#64748b] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            Zero-touch claims. Instant payouts. Complete peace of mind.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={400 + index * 120}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
