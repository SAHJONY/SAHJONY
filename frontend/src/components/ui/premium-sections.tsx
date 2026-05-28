"use client";

import React, { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Shield, 
  LineChart, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Star,
  ChevronRight,
  Globe,
  Lock
} from "lucide-react";

// ============================================
// SCROLL ANIMATION HOOKS
// ============================================

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ isVisible: false, progress: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState({ isVisible: true, progress: entry.intersectionRatio });
            if (triggerOnce) observer.unobserve(element);
          } else if (!triggerOnce) {
            setState({ isVisible: false, progress: 0 });
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, state };
}

function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = scrollY + rect.top;
      const relativeScroll = scrollY - elementTop;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, style: { transform: `translateY(${offset}px)`, willChange: "transform" } };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setProgress(scrollHeight > 0 ? currentScroll / scrollHeight : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

// ============================================
// PREMIUM ANIMATED SECTION WRAPPER
// ============================================

function AnimatedSection({ 
  children, 
  className, 
  delay = 0,
  direction = "up"
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const { ref, state } = useScrollAnimation({ threshold: 0.15 });
  
  const getInitialTransform = () => {
    switch (direction) {
      case "up": return "translateY(60px)";
      case "down": return "translateY(-60px)";
      case "left": return "translateX(60px)";
      case "right": return "translateX(-60px)";
      default: return "translateY(60px)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: state.isVisible ? 1 : 0,
        transform: state.isVisible ? "translate(0)" : getInitialTransform(),
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// PREMIUM HERO SECTION
// ============================================

export function PremiumHero({ 
  title, 
  subtitle, 
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  stats
}: {
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  badge?: { text: string; icon?: ReactNode };
  stats?: Array<{ value: string; label: string }>;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 50;
      const y = (e.clientY - rect.top - rect.height / 2) / 50;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Parallax Background Orbs */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: "transform 0.3s ease-out"
        }}
      >
        {/* Animated gradient orbs with parallax */}
        <div 
          className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-primary/25 rounded-full blur-[150px] animate-float"
          style={{ transform: `translate(${scrollProgress * 80}px, ${mousePosition.y * 10}px)` }}
        />
        <div 
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] animate-float"
          style={{ 
            animationDelay: "2s",
            transform: `translate(${-scrollProgress * 60}px, ${-mousePosition.x * 10}px)`
          }}
        />
        <div 
          className="absolute top-[50%] left-[60%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "4s", transform: `translate(${scrollProgress * 40}px)` }}
        />
        
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      </div>

      {/* Scroll Progress Indicator */}
      <div 
        className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary"
        style={{ 
          width: `${scrollProgress * 100}%`,
          transition: "width 0.1s linear"
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-32 text-center">
        {/* Badge with entrance animation */}
        {badge && (
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-10"
            style={{
              opacity: scrollProgress > 0.05 ? 1 : 0,
              transform: scrollProgress > 0.05 ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
            }}
          >
            {badge.icon && <span className="text-primary">{badge.icon}</span>}
            <span className="text-sm font-medium text-primary tracking-wide">{badge.text}</span>
          </div>
        )}

        {/* Title with staggered animation */}
        <h1 
          className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]"
          style={{
            opacity: scrollProgress > 0.08 ? 1 : 0,
            transform: scrollProgress > 0.08 ? "translateY(0)" : "translateY(60px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s"
          }}
        >
          {title}
          {subtitle && <span className="block gradient-text mt-4">{subtitle}</span>}
        </h1>

        {/* Description */}
        <p 
          className="text-xl md:text-2xl text-text-secondary max-w-[800px] mx-auto mb-14 leading-relaxed"
          style={{
            opacity: scrollProgress > 0.12 ? 1 : 0,
            transform: scrollProgress > 0.12 ? "translateY(0)" : "translateY(40px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s"
          }}
        >
          {description}
        </p>

        {/* CTAs with hover parallax effect */}
        {(primaryCTA || secondaryCTA) && (
          <div 
            className="flex items-center justify-center gap-5 mb-20"
            style={{
              opacity: scrollProgress > 0.16 ? 1 : 0,
              transform: scrollProgress > 0.16 ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s"
            }}
          >
            {primaryCTA && (
              <Link 
                href={primaryCTA.href} 
                className="group btn-primary text-base px-10 py-5 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  {primaryCTA.label}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            )}
            {secondaryCTA && (
              <Link 
                href={secondaryCTA.href} 
                className="btn-secondary text-base px-10 py-5 hover:bg-white/5"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        )}

        {/* Stats with counting animation */}
        {stats && stats.length > 0 && (
          <div 
            className="flex items-center justify-center gap-16 flex-wrap"
            style={{
              opacity: scrollProgress > 0.20 ? 1 : 0,
              transform: scrollProgress > 0.20 ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s"
            }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-5xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                  {stat.value}
                </p>
                <p className="text-text-tertiary text-sm tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parallax Scroll Indicator */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{
          opacity: 1 - scrollProgress * 5,
          transform: `translateX(-50%) translateY(${scrollProgress * 100}px)`
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-text-tertiary text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-7 h-12 rounded-full border-2 border-text-tertiary/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-text-tertiary/70 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM FEATURES GRID
// ============================================

export function PremiumFeatures({ 
  title,
  subtitle,
  features
}: {
  title: string;
  subtitle?: string;
  features: Array<{
    icon: ReactNode;
    title: string;
    description: string;
    color?: string;
  }>;
}) {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.1);
  const colors = [
    "from-primary/25 to-primary/5 text-primary border-primary/25",
    "from-success/25 to-success/5 text-success border-success/25",
    "from-accent/25 to-accent/5 text-accent border-accent/25",
    "from-warning/25 to-warning/5 text-warning border-warning/25",
    "from-purple/25 to-purple/5 text-purple-400 border-purple/25",
    "from-rose/25 to-rose/5 text-rose-400 border-rose/25",
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Parallax background accent */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0 pointer-events-none"
        style={parallaxStyle}
      >
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[300px] h-[300px] bg-accent/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">{title}</h2>
          {subtitle && <p className="text-xl text-text-secondary max-w-[700px] mx-auto">{subtitle}</p>}
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection 
              key={i} 
              delay={i * 0.1}
              className="card-premium group hover:border-primary/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-glow-md"
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center border bg-gradient-to-br mb-6 transition-transform duration-500 group-hover:scale-110",
                colors[i % colors.length]
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-700" />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM PRICING CARD
// ============================================

export function PremiumPricingCard({ 
  plan,
  annual
}: {
  plan: {
    name: string;
    description: string;
    price: string;
    period?: string;
    features: string[];
    notIncluded?: string[];
    cta: string;
    popular?: boolean;
  };
  annual?: boolean;
}) {
  return (
    <AnimatedSection delay={0.2} className={cn(
      "relative card-premium p-8 transition-all duration-500 hover:scale-[1.03]",
      plan.popular && "border-primary/60 shadow-glow-lg scale-105"
    )}>
      {plan.popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <span className="badge badge-primary px-4 py-1.5">Most Popular</span>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
        <p className="text-text-tertiary">{plan.description}</p>
      </div>

      <div className="mb-8">
        <span className="text-5xl font-bold text-white">{plan.price}</span>
        {plan.period && <span className="text-text-tertiary ml-2">{plan.period}</span>}
      </div>

      <ul className="space-y-4 mb-10">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
            </div>
            <span className="text-text-secondary">{feature}</span>
          </li>
        ))}
        {plan.notIncluded?.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 opacity-40">
            <div className="w-5 h-5 rounded-full border border-text-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-text-tertiary" />
            </div>
            <span className="text-text-tertiary line-through">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={cn(
        "w-full py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group",
        plan.popular 
          ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-glow-md hover:shadow-glow-lg" 
          : "bg-surface-elevated border border-border text-white hover:border-primary/50"
      )}>
        <span className="relative z-10">{plan.cta}</span>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </button>
    </AnimatedSection>
  );
}

// ============================================
// PREMIUM TESTIMONIAL
// ============================================

export function PremiumTestimonial({ 
  name,
  role,
  company,
  quote,
  avatar,
  rating = 5
}: {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  rating?: number;
}) {
  return (
    <AnimatedSection className="card-premium p-8 relative overflow-hidden group">
      {/* Decorative quote mark */}
      <div className="absolute top-4 right-6 text-8xl text-primary/10 font-serif leading-none">"</div>
      
      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn(
            "w-4 h-4 transition-colors duration-300",
            i < rating ? "text-warning fill-warning" : "text-text-tertiary"
          )} />
        ))}
      </div>

      {/* Quote */}
      <p className="text-white text-lg leading-relaxed mb-8 relative z-10">
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-glow-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-text-tertiary text-sm">{role} at {company}</p>
        </div>
      </div>

      {/* Hover gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
    </AnimatedSection>
  );
}

// ============================================
// PREMIUM CTA SECTION
// ============================================

export function PremiumCTA({ 
  title,
  description,
  primaryCTA,
  secondaryCTA
}: {
  title: string;
  description: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}) {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.15);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated gradient background with parallax */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0"
        style={parallaxStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/12 via-accent/8 to-primary/12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[200px] animate-pulse-glow" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">{title}</h2>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <p className="text-xl text-text-secondary mb-14 max-w-[700px] mx-auto leading-relaxed">{description}</p>
        </AnimatedSection>
        
        <AnimatedSection delay={0.4} className="flex items-center justify-center gap-5 flex-wrap">
          {primaryCTA && (
            <Link href={primaryCTA.href} className="btn-primary text-base px-10 py-5 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                {primaryCTA.label}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>
          )}
          {secondaryCTA && (
            <Link href={secondaryCTA.href} className="btn-secondary text-base px-10 py-5">
              {secondaryCTA.label}
            </Link>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM LOGO CLOUD
// ============================================

export function PremiumLogoCloud({ 
  title,
  logos
}: {
  title?: string;
  logos: Array<{ name: string; icon?: ReactNode }>;
}) {
  return (
    <section className="relative py-20 border-y border-border/30 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r via-transparent from-primary/5 via-transparent to-primary/5" />
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {title && (
          <AnimatedSection>
            <p className="text-center text-text-tertiary text-sm uppercase tracking-[0.2em] mb-16">{title}</p>
          </AnimatedSection>
        )}
        <div className="flex items-center justify-center gap-16 flex-wrap">
          {logos.map((logo, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="flex items-center gap-3 text-text-tertiary hover:text-text-secondary transition-colors duration-500 group cursor-pointer">
              {logo.icon && <span className="w-7 h-7">{logo.icon}</span>}
              <span className="font-semibold text-xl tracking-wide group-hover:text-primary transition-colors">{logo.name}</span>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM STATS SECTION
// ============================================

export function PremiumStats({ 
  stats
}: {
  stats: Array<{ value: string; label: string; icon?: ReactNode }>;
}) {
  return (
    <section className="relative py-28 bg-surface-elevated/40 overflow-hidden">
      {/* Parallax decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[10%] left-[5%] w-[250px] h-[250px] bg-accent/8 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <AnimatedSection key={i} delay={i * 0.15} className="text-center group">
              {stat.icon && (
                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-5 text-primary group-hover:scale-110 group-hover:bg-primary/25 transition-all duration-500">
                  {stat.icon}
                </div>
              )}
              <p className="text-5xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-500">{stat.value}</p>
              <p className="text-text-tertiary text-sm tracking-wide uppercase">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM FAQ ACCORDION
// ============================================

export function PremiumFAQ({ 
  items
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </AnimatedSection>
        
        <div className="space-y-5">
          {items.map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div 
                className={cn(
                  "card-premium overflow-hidden transition-all duration-500",
                  openIndex === i && "border-primary/40 shadow-glow-sm"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-7 text-left group"
                >
                  <span className="font-semibold text-white text-lg pr-6 group-hover:text-primary transition-colors">{item.question}</span>
                  <ChevronRight className={cn(
                    "w-6 h-6 text-text-tertiary transition-all duration-500 flex-shrink-0",
                    openIndex === i && "rotate-90 text-primary"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-500",
                  openIndex === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <p className="text-text-secondary leading-relaxed px-7 pb-7 text-lg">{item.answer}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PREMIUM NAVIGATION BAR
// ============================================

export function PremiumNav({ 
  logo,
  links,
  cta
}: {
  logo: { text: string; href: string };
  links: Array<{ label: string; href: string }>;
  cta?: { label: string; href: string };
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled 
        ? "bg-black/95 backdrop-blur-2xl border-b border-border/40 shadow-glow-sm" 
        : "bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={logo.href} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-500">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">{logo.text}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {links.map((link, i) => (
            <Link 
              key={i} 
              href={link.href}
              className="text-sm text-text-secondary hover:text-white transition-colors duration-300 relative group py-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        {cta && (
          <Link href={cta.href} className="hidden lg:flex btn-primary text-sm px-7 py-3.5 relative overflow-hidden group">
            <span className="relative z-10 flex items-center">
              {cta.label}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-3 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={cn("h-0.5 bg-current transition-all duration-300", mobileMenuOpen && "rotate-45 translate-y-2")} />
            <span className={cn("h-0.5 bg-current transition-all duration-300", mobileMenuOpen && "opacity-0")} />
            <span className={cn("h-0.5 bg-current transition-all duration-300", mobileMenuOpen && "-rotate-45 -translate-y-2")} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-border/40 transition-all duration-500 overflow-hidden",
        mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-8 flex flex-col gap-6">
          {links.map((link, i) => (
            <Link 
              key={i} 
              href={link.href}
              className="text-lg text-text-secondary hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {cta && (
            <Link href={cta.href} className="btn-primary text-center py-4">
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ============================================
// PREMIUM FOOTER
// ============================================

export function PremiumFooter({ 
  columns,
  bottom
}: {
  columns: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  bottom?: { text: string; links: Array<{ label: string; href: string }> };
}) {
  return (
    <footer className="relative border-t border-border/40 py-20 bg-surface/30 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-14 mb-16">
          {columns.map((column, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <h4 className="font-semibold text-white mb-6 text-lg">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-text-tertiary hover:text-white transition-colors duration-300 text-sm inline-block py-1 group">
                      {link.label}
                      <span className="block max-w-0 group-hover:max-w-full h-[1px] bg-primary transition-all duration-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          ))}
        </div>

        {bottom && (
          <div className="pt-10 border-t border-border/40 flex items-center justify-between flex-wrap gap-6">
            <p className="text-text-tertiary text-sm">{bottom.text}</p>
            <div className="flex items-center gap-8">
              {bottom.links.map((link, i) => (
                <Link key={i} href={link.href} className="text-text-tertiary hover:text-white transition-colors text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}