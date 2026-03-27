import { useEffect, useState, useRef } from 'react';
import Navigation from '../sections/Navigation';
import Hero from '../sections/Hero';
import Problem from '../sections/Problem';
import Solution from '../sections/Solution';
import HowItWorks from '../sections/HowItWorks';
import Dashboard from '../sections/Dashboard';
import Pricing from '../sections/Pricing';
import Testimonials from '../sections/Testimonials';
import FAQ from '../sections/FAQ';
import CTA from '../sections/CTA';
import Footer from '../sections/Footer';

export function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger initial load animation
    setTimeout(() => setIsLoaded(true), 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoaded]);

  return (
    <div 
      ref={mainRef}
      className={`min-h-screen bg-white transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      <Navigation scrollY={scrollY} />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Dashboard />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
