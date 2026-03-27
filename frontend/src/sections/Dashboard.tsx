import { useEffect, useRef, useState } from 'react';
import { History, PiggyBank, Cloud, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  delay: number;
  isVisible: boolean;
}

const StatCard = ({ value, label, delay, isVisible }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      
      // Don't animate ranges or complex strings
      if (value.includes('-') || value.includes('₹')) {
        setDisplayValue(value);
        return;
      }

      // Parse value
      const numericMatch = value.match(/[0-9.]+/);
      if (!numericMatch) {
        setDisplayValue(value);
        return;
      }
      
      const numericValue = parseFloat(numericMatch[0]);
      const prefix = value.substring(0, value.indexOf(numericMatch[0]));
      const suffix = value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length);
      
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = numericValue * eased;
        
        if (value.includes('.')) {
          setDisplayValue(prefix + current.toFixed(1) + suffix);
        } else {
          setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, delay);
    }
  }, [isVisible, value, delay]);

  return (
    <div 
      className={`text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-2">{displayValue}</p>
      <p className="text-[#64748b] text-sm font-medium">{label}</p>
    </div>
  );
};

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { value: '₹2.4Cr+', label: 'Total Claims Paid' },
    { value: '8-12 min', label: 'Average Payout Time' },
    { value: '95%+', label: 'Fraud Detection Accuracy' },
    { value: '10K+', label: 'Active Policies' },
  ];

  const features = [
    {
      icon: Cloud,
      title: 'Live Risk Forecast',
      description: '7-day weather and risk predictions for your zone',
    },
    {
      icon: History,
      title: 'Claims History',
      description: 'Track all your claims and payouts in one place',
    },
    {
      icon: PiggyBank,
      title: 'Earnings Protection',
      description: 'See how much income you\'ve protected',
    },
  ];

  return (
    <section 
      id="dashboard" 
      ref={sectionRef}
      className="py-24 gig-gradient-bg relative overflow-hidden"
    >
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          transition: 'transform 0.5s ease-out',
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="gig-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Your Protection Dashboard
          </h2>
          <p 
            className={`text-lg text-blue-200 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            Real-time visibility into your coverage, claims, and earnings protection
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              delay={500 + index * 150}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Dashboard Preview */}
        <div 
          className={`relative mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ 
            transitionDelay: '700ms',
            perspective: '1500px',
          }}
        >
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              transform: `perspective(1500px) rotateX(${10 + mousePosition.y * 5}deg) rotateY(${-5 + mousePosition.x * 5}deg)`,
              transition: 'transform 0.4s ease-out',
            }}
          >
            <img
              src="/images/dashboard-preview.jpg"
              alt="PolicyPilotAI Dashboard"
              className="w-full h-auto"
            />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a2d8d]/20 via-transparent to-[#f97316]/20 pointer-events-none" />
          </div>

          {/* Floating Status Cards */}
          <div 
            className={`absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ 
              transitionDelay: '1000ms',
              animation: 'float 5s ease-in-out infinite',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-[#0f172a]">Policy Active</span>
            </div>
          </div>

          <div 
            className={`absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ 
              transitionDelay: '1100ms',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '1s',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-[#0f172a]">Rain Alert: Tomorrow</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 transition-all duration-500 hover:bg-white/20 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${1200 + index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-200 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
