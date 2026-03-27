import { useEffect, useRef, useState } from 'react';

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

      const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
      const suffix = value.replace(/[0-9.]/g, '');
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = numericValue * eased;
        
        if (value.includes('.')) {
          setDisplayValue(current.toFixed(1) + suffix);
        } else {
          setDisplayValue(Math.floor(current).toLocaleString() + suffix);
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
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-3xl sm:text-4xl font-bold text-[#0a2d8d] mb-2">{displayValue}</p>
      <p className="text-sm text-[#64748b]">{label}</p>
    </div>
  );
};

const Problem = () => {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '7.7M+', label: 'Delivery Partners in India' },
    { value: '20-30%', label: 'Monthly Income Loss' },
    { value: '4-6 hrs', label: 'Average Work Lost/Day' },
    { value: '₹15-25K', label: 'Average Monthly Income' },
  ];

  return (
    <section 
      id="problem" 
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#0a2d8d]/5 to-transparent rounded-full blur-3xl" />
      
      <div className="gig-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Section Label */}
            <div 
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="section-label">The Problem</span>
            </div>

            {/* Headline */}
            <h2 
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] leading-tight transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              Gig Workers Lose{' '}
              <span className="text-[#f97316]">20-30%</span> Income to Factors Beyond Their Control
            </h2>

            {/* Body Text */}
            <p 
              className={`text-lg text-[#64748b] leading-relaxed transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              India's 7.7 million delivery partners face unpredictable income loss from heavy rain, 
              extreme heat, pollution alerts, and zone disruptions. Traditional insurance doesn't 
              cover income protection — leaving workers vulnerable every single day.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  delay={600 + index * 100}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div 
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/problem-delivery-rain.jpg"
                alt="Delivery worker in rain"
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2d8d]/30 to-transparent" />
            </div>

            {/* Floating Badge */}
            <div 
              className={`absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Income at Risk</p>
                  <p className="text-xs text-[#64748b]">No financial buffer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
