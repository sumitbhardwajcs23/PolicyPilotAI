import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is parametric insurance?',
    answer: 'Parametric insurance pays out automatically when specific conditions (like rainfall over 50mm/hr) are met. No need to file claims or provide proof of loss.',
  },
  {
    question: 'How quickly do I get paid?',
    answer: 'Once a triggering event is detected and verified, payouts reach your UPI account within 8-12 minutes on average.',
  },
  {
    question: 'What events are covered?',
    answer: 'Heavy rainfall (>50mm/hr), extreme heat (heat index >45°C), severe pollution (AQI >400), flooding alerts, and zone closures/curfews.',
  },
  {
    question: 'How is my premium calculated?',
    answer: 'Our AI analyzes your delivery zone\'s risk profile, seasonal factors, and your work patterns to calculate a fair weekly premium starting at ₹29.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your policy anytime with no cancellation fees. Your coverage continues until the end of your current paid week.',
  },
  {
    question: 'Is there a waiting period?',
    answer: 'No waiting period for most events. Your coverage starts immediately after your first premium payment.',
  },
  {
    question: 'How do you prevent fraud?',
    answer: 'We use GPS verification, weather API cross-checking, behavioral analysis, and platform login verification to ensure 95%+ fraud detection accuracy.',
  },
  {
    question: 'What if I work for multiple platforms?',
    answer: 'You can specify your primary platform during registration. Coverage applies regardless of which platform you\'re working for when disruption hits.',
  },
];

const FAQAccordion = ({ item, isOpen, onToggle, delay, isVisible }: { 
  item: FAQItem; 
  isOpen: boolean; 
  onToggle: () => void;
  delay: number;
  isVisible: boolean;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div 
      className={`border-b border-gray-200 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isOpen ? 'bg-blue-50/50' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full py-5 px-4 flex items-center justify-between text-left transition-colors hover:bg-gray-50"
      >
        <span className="font-semibold text-[#0f172a] pr-4">{item.question}</span>
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isOpen ? 'bg-[#0a2d8d] rotate-45' : 'bg-gray-100'
          }`}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <Plus className="w-4 h-4 text-[#0a2d8d]" />
          )}
        </div>
      </button>
      <div 
        className="overflow-hidden transition-all duration-400"
        style={{ 
          height,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div ref={contentRef} className="px-4 pb-5">
          <p className="text-[#64748b] leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQs into two columns
  const leftColumn = faqItems.filter((_, i) => i % 2 === 0);
  const rightColumn = faqItems.filter((_, i) => i % 2 === 1);

  return (
    <section 
      id="faq" 
      ref={sectionRef}
      className="py-24 bg-[#f8fafc] relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0a2d8d]/5 rounded-full blur-3xl" />

      <div className="gig-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span 
            className={`section-label transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            FAQ
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] mt-4 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Frequently Asked <span className="text-[#f97316]">Questions</span>
          </h2>
        </div>

        {/* FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-x-8 max-w-5xl mx-auto">
          {/* Left Column */}
          <div>
            {leftColumn.map((item, index) => (
              <FAQAccordion
                key={item.question}
                item={item}
                isOpen={openIndex === index * 2}
                onToggle={() => handleToggle(index * 2)}
                delay={200 + index * 80}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Right Column */}
          <div>
            {rightColumn.map((item, index) => (
              <FAQAccordion
                key={item.question}
                item={item}
                isOpen={openIndex === index * 2 + 1}
                onToggle={() => handleToggle(index * 2 + 1)}
                delay={200 + index * 80 + 40}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div 
          className={`text-center mt-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <p className="text-[#64748b] mb-4">Still have questions?</p>
          <button className="gig-btn-secondary">
            Contact Our Support Team
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
