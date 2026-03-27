import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rajesh K.',
    location: 'Delhi',
    quote: 'Last monsoon, heavy rain stopped my work for 4 hours. Before I could even think about claiming, ₹600 was already in my UPI. PolicyPilotAI just knew!',
    avatar: '/images/avatar-rajesh.jpg',
    rating: 5,
  },
  {
    name: 'Priya M.',
    location: 'Mumbai',
    quote: '₹49/week is nothing compared to the peace of mind. When pollution alerts hit, I know I\'m covered if I can\'t work.',
    avatar: '/images/avatar-priya.jpg',
    rating: 5,
  },
  {
    name: 'Amit S.',
    location: 'Bangalore',
    quote: 'The fraud detection is amazing. My friend tried to cheat the system and got caught immediately. Makes me trust the platform more.',
    avatar: '/images/avatar-amit.jpg',
    rating: 5,
  },
  {
    name: 'Sunita R.',
    location: 'Hyderabad',
    quote: '3-minute signup, automatic claims, instant money. This is how insurance should work for people like us.',
    avatar: '/images/avatar-sunita.jpg',
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial, isVisible, delay }: { testimonial: Testimonial; isVisible: boolean; delay: number }) => {
  return (
    <div 
      className={`flex-shrink-0 w-[350px] bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-[#0a2d8d]/20" />
      </div>

      {/* Quote Text */}
      <p className="text-[#0f172a] mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Rotating Ring */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #0a2d8d, #f97316, #0a2d8d)',
              padding: '2px',
              animation: 'rotateRing 4s linear infinite',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
            }}
          />
        </div>
        <div>
          <p className="font-semibold text-[#0f172a]">{testimonial.name}</p>
          <p className="text-sm text-[#64748b]">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Duplicate testimonials for infinite scroll
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f8fafc] to-transparent" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="gig-container text-center max-w-3xl mx-auto mb-16">
          <span 
            className={`section-label transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Testimonials
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-['Poppins'] text-[#0f172a] mt-4 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            What Delivery Partners <span className="text-[#f97316]">Say</span>
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div 
          ref={scrollRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`flex gap-6 py-4 ${isVisible ? 'animate-scroll-carousel' : ''}`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {allTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                testimonial={testimonial}
                isVisible={isVisible}
                delay={200 + (index % testimonials.length) * 100}
              />
            ))}
          </div>

          {/* Fade Edges */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        {/* Stats Row */}
        <div className="gig-container mt-16">
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {[
              { value: '4.9/5', label: 'Average Rating' },
              { value: '10K+', label: 'Happy Workers' },
              { value: '95%', label: 'Would Recommend' },
              { value: '50+', label: 'Cities Covered' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#0a2d8d]">{stat.value}</p>
                <p className="text-sm text-[#64748b]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotateRing {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
