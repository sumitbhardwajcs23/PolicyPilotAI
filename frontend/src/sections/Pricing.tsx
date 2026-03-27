import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  coverage: string;
  events: string;
  features: string[];
  popular?: boolean;
  gradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: '₹49',
    coverage: '₹1,500',
    events: '2 events/week',
    features: [
      'Rain protection',
      'Heat cover',
      'UPI payouts',
      'Auto-renewal',
    ],
    gradient: 'from-gray-50 to-white',
  },
  {
    name: 'Standard',
    price: '₹79',
    coverage: '₹2,500',
    events: '3 events/week',
    features: [
      'Everything in Basic',
      'Pollution alerts',
      'Priority processing',
      '24/7 support',
    ],
    popular: true,
    gradient: 'from-blue-50 to-white',
  },
  {
    name: 'Premium',
    price: '₹129',
    coverage: '₹4,000',
    events: '5 events/week',
    features: [
      'Everything in Standard',
      'Social disruption',
      'Festival coverage',
      'Personal advisor',
    ],
    gradient: 'from-orange-50 to-white',
  },
];

const Pricing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

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

  return (
    <section 
      id="pricing" 
      ref={sectionRef}
      className="py-24 bg-[#f8fafc] relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0a2d8d]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f97316]/5 rounded-full blur-3xl" />

      <div className="gig-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className={`section-label transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Pricing
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] mt-4 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Affordable Protection for <span className="text-[#f97316]">Every Worker</span>
          </h2>
          <p 
            className={`text-lg text-[#64748b] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            Weekly micro-premiums that fit your payout cycle. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          style={{ perspective: '1200px' }}
        >
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative transition-all duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transitionDelay: `${200 + index * 150}ms`,
                transform: isVisible
                  ? hoveredCard === index
                    ? 'rotateY(0deg) translateZ(80px) scale(1.05)'
                    : tier.popular
                    ? 'rotateY(0deg) translateZ(50px) scale(1.05)'
                    : index === 0
                    ? 'rotateY(5deg) translateZ(-30px)'
                    : 'rotateY(-5deg) translateZ(-30px)'
                  : index === 0
                  ? 'rotateY(45deg) translateX(-100px)'
                  : index === 2
                  ? 'rotateY(-45deg) translateX(100px)'
                  : 'translateY(50px) scale(0.8)',
                transformStyle: 'preserve-3d',
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div 
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 z-10 transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ 
                    transitionDelay: '600ms',
                    animation: tier.popular ? 'badgePulse 2s infinite' : 'none',
                  }}
                >
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div 
                className={`bg-gradient-to-br ${tier.gradient} rounded-2xl p-8 border-2 transition-all duration-300 h-full flex flex-col ${
                  tier.popular
                    ? 'border-[#0a2d8d] shadow-xl shadow-[#0a2d8d]/10'
                    : 'border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <p className="text-xs text-[#64748b] mb-2 text-center">
                  PolicyPilotAI: <span className="gig-gradient-text">AI-Powered</span> Parametric Insurance
                </p>
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[#0a2d8d]">{tier.price}</span>
                    <span className="text-[#64748b]">/week</span>
                  </div>
                </div>

                {/* Coverage Info */}
                <div className="bg-white rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#64748b]">Max Coverage</span>
                    <span className="font-semibold text-[#0f172a]">{tier.coverage}/week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#64748b]">Events Covered</span>
                    <span className="font-semibold text-[#0f172a]">{tier.events}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <li 
                      key={feature}
                      className="flex items-center gap-3"
                      style={{ 
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                        transition: `all 0.3s ease-out ${700 + index * 150 + featureIndex * 50}ms`,
                      }}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tier.popular ? 'bg-[#0a2d8d]' : 'bg-green-500'
                      }`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[#0f172a] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group ${
                    tier.popular
                      ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:shadow-lg hover:shadow-orange-500/30'
                      : 'bg-[#0a2d8d] text-white hover:bg-[#1e3a8a]'
                  }`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <p 
          className={`text-center text-[#64748b] mt-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          All plans include instant UPI payouts and automatic claim processing.
        </p>
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </section>
  );
};

export default Pricing;
