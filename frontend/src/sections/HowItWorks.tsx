import { useEffect, useRef, useState } from 'react';
import { Smartphone, Calculator, CreditCard, CheckCircle, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: React.ElementType;
  bgGradient: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Register in 30 Seconds',
    description: 'Enter your mobile number, verify with OTP, and provide basic details. No lengthy forms, no documentation hassle.',
    features: ['Mobile OTP verification', 'Basic KYC', 'UPI ID setup'],
    image: '/images/step1-register.jpg',
    icon: Smartphone,
    bgGradient: 'from-blue-50 to-white',
  },
  {
    id: 2,
    title: 'Get AI-Calculated Premium',
    description: 'Our AI analyzes your delivery zone, seasonal risks, and work patterns to give you a fair, personalized weekly premium.',
    features: ['Zone-based risk scoring', 'Seasonal adjustments', 'Loyalty discounts'],
    image: '/images/step2-premium.jpg',
    icon: Calculator,
    bgGradient: 'from-orange-50 to-white',
  },
  {
    id: 3,
    title: 'Pay Weekly — Stay Protected',
    description: 'Affordable micro-premiums starting at ₹49/week. Pay via UPI, cards, or enable auto-renewal for uninterrupted coverage.',
    features: ['UPI & card payments', 'Auto-renewal option', 'Instant policy activation'],
    image: '/images/step3-payment.jpg',
    icon: CreditCard,
    bgGradient: 'from-green-50 to-white',
  },
  {
    id: 4,
    title: 'Automatic Claims & Payouts',
    description: 'When disruption hits, we detect it automatically. No need to file claims. Money reaches your UPI within 8-12 minutes.',
    features: ['Zero-touch claim trigger', '8-12 min payout', 'SMS confirmation'],
    image: '/images/step4-payout.jpg',
    icon: CheckCircle,
    bgGradient: 'from-yellow-50 to-white',
  },
];

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="pt-32 pb-24 bg-white relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

      <div className="gig-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className={`section-label transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            How It Works
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] mt-4 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Get Protected in <span className="text-[#f97316]">3 Minutes</span>
          </h2>
          <p 
            className={`text-lg text-[#64748b] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            Simple onboarding. Automatic protection. Instant payouts.
          </p>
        </div>

        {/* Steps Navigation */}
        <div 
          className={`flex justify-center mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex items-center gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-[#0a2d8d] text-white'
                    : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === index ? 'bg-white text-[#0a2d8d]' : 'bg-[#0a2d8d] text-white'
                }`}>
                  {step.id}
                </span>
                <span className="hidden sm:inline text-sm font-medium">{step.title.split(' ')[0]}</span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 hidden sm:block" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Step Content */}
        <div className="relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`transition-all duration-500 ${
                activeStep === index
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible absolute inset-0'
              }`}
            >
              <div className={`grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br ${step.bgGradient} rounded-3xl p-8 lg:p-12`}>
                {/* Image */}
                <div 
                  className={`relative transition-all duration-700 ${
                    activeStep === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {/* Step Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#0a2d8d] rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div 
                  className={`space-y-6 transition-all duration-700 ${
                    activeStep === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <div>
                    <span className="text-sm font-semibold text-[#f97316]">Step {step.id}</span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mt-2 font-['Poppins']">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-lg text-[#64748b] leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <li 
                        key={feature}
                        className="flex items-center gap-3"
                        style={{ 
                          animation: activeStep === index ? `slideInUp 0.4s ease-out ${300 + featureIndex * 100}ms forwards` : 'none',
                          opacity: activeStep === index ? 1 : 0
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-[#0f172a]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index
                  ? 'bg-[#0a2d8d] w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
