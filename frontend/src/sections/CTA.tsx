import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, Check } from 'lucide-react';

const CTA = () => {
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

  const trustPoints = [
    'No credit card required',
    'Cancel anytime',
    '3-minute setup',
  ];

  return (
    <section 
      id="cta" 
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #0a2d8d 0%, #1e3a8a 50%, #0f172a 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Floating Elements */}
      <div 
        className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-10 right-10 w-32 h-32 bg-[#f97316]/20 rounded-full blur-xl"
        style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"
        style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '1s' }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="gig-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-white mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Protect Your Income Today
          </h2>

          {/* Subheadline */}
          <p 
            className={`text-lg text-blue-200 mb-10 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Join 10,000+ delivery partners who trust PolicyPilotAI. Starting at just ₹49/week.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-wrap justify-center gap-4 mb-8 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '550ms' }}
          >
            <button 
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1"
              style={{ animation: isVisible ? 'ctaGlow 3s infinite' : 'none' }}
            >
              Get Protected Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 hover:-translate-y-1">
              <MessageCircle className="w-5 h-5" />
              Talk to Our Team
            </button>
          </div>

          {/* Trust Points */}
          <div 
            className={`flex flex-wrap justify-center gap-6 transition-all duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '850ms' }}
          >
            {trustPoints.map((point, index) => (
              <div 
                key={point} 
                className="flex items-center gap-2 text-blue-200 text-sm"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.3s ease-out ${900 + index * 100}ms`,
                }}
              >
                <Check className="w-4 h-4 text-green-400" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.3); }
        }
      `}</style>
    </section>
  );
};

export default CTA;
