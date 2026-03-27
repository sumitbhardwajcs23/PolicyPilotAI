import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Easing functions
export const easings = {
  expoOut: 'expo.out',
  expoIn: 'expo.in',
  power3Out: 'power3.out',
  power2Out: 'power2.out',
  elasticOut: 'elastic.out(1, 0.5)',
  backOut: 'back.out(1.7)',
};

// Page load animation sequence
export function pageLoadAnimation() {
  const tl = gsap.timeline({ defaults: { ease: easings.expoOut } });
  
  tl.from('.sidebar', {
    x: -100,
    opacity: 0,
    duration: 0.5,
  })
  .from('.header', {
    y: -30,
    opacity: 0,
    duration: 0.4,
  }, '-=0.3')
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  if (dashboardCards.length > 0) {
    tl.from(dashboardCards, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
    }, '-=0.2');
  }
  
  return tl;
}

// Card hover animation
export function cardHoverAnimation(element: HTMLElement, isEnter: boolean) {
  gsap.to(element, {
    scale: isEnter ? 1.02 : 1,
    duration: 0.2,
    ease: easings.power2Out,
  });
}

// Number counting animation
export function countUpAnimation(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 1,
  prefix: string = '',
  suffix: string = ''
) {
  const obj = { value: start };
  
  return gsap.to(obj, {
    value: end,
    duration,
    ease: easings.expoOut,
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(obj.value).toLocaleString()}${suffix}`;
    },
  });
}

// Gauge needle animation
export function gaugeNeedleAnimation(
  element: HTMLElement,
  targetRotation: number,
  duration: number = 0.8
) {
  return gsap.fromTo(
    element,
    { rotation: -90 },
    {
      rotation: targetRotation - 90,
      duration,
      ease: easings.expoOut,
    }
  );
}

// Workflow path animation
export function workflowPathAnimation(pathElement: SVGPathElement, dotElement: SVGCircleElement) {
  const pathLength = pathElement.getTotalLength();
  
  gsap.set(pathElement, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });
  
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration: 2,
    ease: 'none',
  });
  
  // Animate dot along path
  const progressObj = { value: 0 };
  tl.to(
    progressObj,
    {
      value: 1,
      duration: 2,
      ease: 'none',
      onUpdate: () => {
        const point = pathElement.getPointAtLength(progressObj.value * pathLength);
        dotElement.setAttribute('cx', String(point.x));
        dotElement.setAttribute('cy', String(point.y));
      },
    },
    0
  );
  
  return tl;
}

// Scroll reveal animation
export function scrollRevealAnimation(
  elements: string | HTMLElement | HTMLElement[],
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  } = {}
) {
  const {
    y = 30,
    opacity = 0,
    duration = 0.6,
    stagger = 0.1,
    start = 'top 80%',
  } = options;
  
  return gsap.from(elements, {
    y,
    opacity,
    duration,
    stagger,
    ease: easings.expoOut,
    scrollTrigger: {
      trigger: elements as any,
      start,
      toggleActions: 'play none none none',
    },
  });
}

// Stagger children animation
export function staggerChildrenAnimation(
  container: HTMLElement,
  childSelector: string,
  options: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
  } = {}
) {
  const {
    y = 20,
    duration = 0.4,
    stagger = 0.05,
    delay = 0,
  } = options;
  
  const children = container.querySelectorAll(childSelector);
  
  return gsap.from(children, {
    y,
    opacity: 0,
    duration,
    stagger,
    delay,
    ease: easings.expoOut,
  });
}

// Shake animation for notifications
export function shakeAnimation(element: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(element, { x: -5, duration: 0.1 })
    .to(element, { x: 5, duration: 0.1 })
    .to(element, { x: -5, duration: 0.1 })
    .to(element, { x: 5, duration: 0.1 })
    .to(element, { x: 0, duration: 0.1 });
  return tl;
}

// Fade in/out animation
export function fadeAnimation(
  element: HTMLElement,
  show: boolean,
  duration: number = 0.3
) {
  return gsap.to(element, {
    opacity: show ? 1 : 0,
    duration,
    ease: easings.power2Out,
  });
}

// Slide animation
export function slideAnimation(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down',
  show: boolean,
  duration: number = 0.3
) {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  };
  
  const { x, y } = directions[direction];
  
  if (show) {
    gsap.set(element, { x, y, opacity: 0 });
    return gsap.to(element, {
      x: 0,
      y: 0,
      opacity: 1,
      duration,
      ease: easings.expoOut,
    });
  } else {
    return gsap.to(element, {
      x,
      y,
      opacity: 0,
      duration,
      ease: easings.expoIn,
    });
  }
}

// Pulse animation
export function pulseAnimation(element: HTMLElement, options: {
  scale?: number;
  duration?: number;
  repeat?: number;
} = {}) {
  const { scale = 1.1, duration = 0.5, repeat = -1 } = options;
  
  return gsap.to(element, {
    scale,
    duration,
    repeat,
    yoyo: true,
    ease: 'power1.inOut',
  });
}

// Cleanup function for ScrollTrigger
export function cleanupAnimations() {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
