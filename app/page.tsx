"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/SignInButton";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import {
  Smartphone,
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
  CheckCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: session, isPending } = useSession();
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      gsap.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power3.out" }
      );

      gsap.fromTo(
        ".hero-buttons",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" }
      );

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            delay: 0.6,
            ease: "back.out(1.7)",
          }
        );
      }

      // Navbar animation
      if (headerRef.current) {
        gsap.set(headerRef.current, { yPercent: -100 });
        gsap.to(headerRef.current, {
          yPercent: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 100px",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Steps horizontal scroll animation
      if (featuresRef.current) {
        const stepsWrapper = featuresRef.current.querySelector('.steps-wrapper');
        const stepCards = featuresRef.current.querySelectorAll('.step-card');
        
        if (stepsWrapper && stepCards.length > 0) {
          // Calculate the total scroll distance (3 cards * 33% each = 99%)
          const totalScrollDistance = stepCards.length * 33;
          console.log('Total scroll distance:', totalScrollDistance + '%', 'Cards:', stepCards.length);
          console.log('Window width:', window.innerWidth);
          
          // Create horizontal scroll animation
          gsap.to(stepsWrapper, {
            x: () => -(stepCards.length * window.innerWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top top",
              end: `+=${totalScrollDistance}%`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              id: "steps-scroll"
            }
          });
          
          // Set initial state for all cards
          stepCards.forEach((card, index) => {
            gsap.set(card, { 
              opacity: index === 0 ? 1 : 0, 
              scale: index === 0 ? 1 : 0.8,
              y: index === 0 ? 0 : 50
            });
          });
          
          // Create a single scroll trigger that handles all card animations
          ScrollTrigger.create({
            trigger: featuresRef.current,
            start: "top top",
            end: "+=99%",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              console.log('Scroll progress:', progress);
              
              stepCards.forEach((card, index) => {
                const cardStart = index / stepCards.length;
                const cardEnd = (index + 1) / stepCards.length;
                
                if (progress >= cardStart && progress < cardEnd) {
                  // Show this card
                  gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                  console.log(`Showing card ${index + 1}`);
                } else {
                  // Hide this card
                  gsap.to(card, {
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                }
              });
            }
          });
        }
      }

      // Analytics section animations
      if (analyticsRef.current) {
        // Section brightness animation
        gsap.fromTo(
          analyticsRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1,
            },
          }
        );

        // Text sliding animations - sliding from extremities to center
        gsap.fromTo(
          ".analytics-title",
          { opacity: 0, x: -200 },
          {
            opacity: 1,
            x: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 70%",
            },
          }
        );

        gsap.fromTo(
          ".analytics-subtitle",
          { opacity: 0, x: -150 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            delay: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 70%",
            },
          }
        );

        // Graph sliding animation - sliding from right extremity to center
        gsap.fromTo(
          ".analytics-graph",
          { opacity: 0, x: 300 },
          {
            opacity: 1,
            x: 0,
            duration: 1.5,
            delay: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 70%",
            },
          }
        );

        // Moving graph animation with wave-like movement
        gsap.fromTo(
          "#analytics-line",
          { 
            strokeDasharray: "0 1000",
            strokeDashoffset: "1000"
          },
          {
            strokeDasharray: "1000 0",
            strokeDashoffset: "0",
            duration: 3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 60%",
            },
          }
        );

        // Data points animation
        gsap.fromTo(
          "#analytics-line + circle",
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: "top 60%",
            },
          }
        );

        // Wave-like movement animation that stops after scroll
        const waveTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: analyticsRef.current,
            start: "top 60%",
            end: "bottom 20%",
            scrub: 1,
            onUpdate: (self) => {
              // Create wave effect by animating the path
              const progress = self.progress;
              const waveOffset = Math.sin(progress * Math.PI * 4) * 10; // Wave amplitude
              
              // Apply wave transformation to the line
              gsap.set("#analytics-line", {
                attr: {
                  d: `M20,${160 + waveOffset} Q60,${120 + waveOffset} 100,${100 + waveOffset} T180,${80 + waveOffset} T260,${60 + waveOffset}`
                }
              });
              
              // Apply same wave to data points
              const circles = document.querySelectorAll('#analytics-line + circle');
              circles.forEach((circle, index) => {
                const baseY = [160, 120, 100, 90, 80, 70, 60][index];
                gsap.set(circle, {
                  attr: {
                    cy: baseY + waveOffset
                  }
                });
              });
            }
          }
        });
      }

      // Hero section scroll animations - move to extremities when scrolling to section 2
      if (heroRef.current && featuresRef.current) {
        // Move hero text to left extremity
        gsap.to(".hero-text-content", {
          x: -200,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });

        // Move hero image to right extremity
        gsap.to(".hero-image-content", {
          x: 200,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });
      }

      // CTA section animation
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="min-h-screen bg-background"
      style={{ scrollSnapType: "none" }}
      ref={heroRef}
    >
      {/* Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">Vendora</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
            {!isPending && (
              <div>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <SignInButton />
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <section className="panel h-screen flex items-center justify-center relative overflow-hidden pt-16">
        <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="hero-text-content text-center lg:text-left">
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-black text-balance mb-6">
              <span className="text-primary">Digitizing</span>{" "}
              <span className="text-foreground">Indian</span>{" "}
              <span className="text-primary">Street Food Commerce</span>
            </h1>

            <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 text-pretty">
              Empowering street food vendors with digital menus, QR code
              ordering, and seamless UPI payments.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              {isPending ? (
                <Button size="lg" disabled>
                  Loading...
                </Button>
              ) : session ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>

          {/* Right side - Street food stall image */}
          <div ref={imageRef} className="hero-image-content flex justify-center lg:justify-end">
            <Image
              src="/street-food-stall.png"
              alt="Indian street food vendor at colorful stall"
              width={512}
              height={512}
              className="w-full max-w-lg h-auto"
            />
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        id="features"
        className="panel h-screen flex items-center overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-balance mb-4">
              How <span className="text-primary">Vendora</span> Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simple steps to digitize your street food business
            </p>
          </div>

          <div className="steps-container relative w-full h-[60vh] overflow-hidden">
            <div className="steps-wrapper flex w-max">
              {/* Step 1 */}
              <div className="step-card flex-shrink-0 w-screen px-8">
                <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5 h-full flex flex-col items-center justify-center">
                  <h3 className="text-4xl font-bold mb-8 text-center">Create Your Digital Stall</h3>
                  <p className="text-muted-foreground text-center text-xl max-w-2xl leading-relaxed">
                    Put your stall on the web in just a few steps. Add your name, UPI ID, and menu items, and your digital shop is ready. No apps, no setup cost — just your food, now easier to find and order.
                  </p>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="step-card flex-shrink-0 w-screen px-8">
                <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5 h-full flex flex-col items-center justify-center">
                  <h3 className="text-4xl font-bold mb-8 text-center">Share Your QR Code</h3>
                  <p className="text-muted-foreground text-center text-xl max-w-2xl leading-relaxed">
                    Customers simply scan your QR code to open your menu, pick what they want, and pay instantly through their UPI app. No confusion, no waiting — just a smooth ordering experience for both sides.
                  </p>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="step-card flex-shrink-0 w-screen px-8">
                <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5 h-full flex flex-col items-center justify-center">
                  <h3 className="text-4xl font-bold mb-8 text-center">Manage Orders & Track Sales</h3>
                  <p className="text-muted-foreground text-center text-xl max-w-2xl leading-relaxed">
                    Every order you receive is neatly stacked in one place. Confirm payments, accept or reject requests, and see your sales at a glance. Your notebook stays clean, and your business stays in control.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section
        ref={analyticsRef}
        className="panel h-screen flex items-center justify-center bg-background relative overflow-hidden"
      >
        {/* Decorative threads */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <path
              d="M100,200 Q300,100 500,200 T900,200"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              opacity="0.3"
            />
            <path
              d="M50,400 Q250,300 450,400 T850,400"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              opacity="0.3"
            />
            <path
              d="M150,600 Q350,500 550,600 T950,600"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              opacity="0.3"
            />
            <path
              d="M200,800 Q400,700 600,800 T1000,800"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              opacity="0.3"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <h2 className="analytics-title text-4xl md:text-6xl lg:text-7xl font-black text-balance mb-6">
                Analytics that <span className="text-primary">accelerate</span> your business
              </h2>
              <p className="analytics-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 text-pretty">
                Transform your street food business with powerful insights. Track sales, 
                analyze trends, and make data-driven decisions that boost your revenue.
              </p>
            </div>

            {/* Right side - Analytics Graph */}
            <div className="analytics-graph flex justify-center lg:justify-end">
              <div className="w-full max-w-lg bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-center mb-2">Sales Analytics</h3>
                  <p className="text-sm text-muted-foreground text-center">Last 7 days performance</p>
                </div>
                
                {/* Moving Graph */}
                <div className="relative h-64 bg-background rounded-lg p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Moving line graph */}
                    <path
                      id="analytics-line"
                      d="M20,160 Q60,120 100,100 T180,80 T260,60"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-green-500"
                    />
                    
                    {/* Data points */}
                    <circle cx="20" cy="160" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="60" cy="120" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="100" cy="100" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="140" cy="90" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="180" cy="80" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="220" cy="70" r="4" fill="currentColor" className="text-green-500" />
                    <circle cx="260" cy="60" r="4" fill="currentColor" className="text-green-500" />
                    
                    {/* Labels */}
                    <text x="20" y="190" className="text-xs fill-current text-muted-foreground">Mon</text>
                    <text x="60" y="190" className="text-xs fill-current text-muted-foreground">Tue</text>
                    <text x="100" y="190" className="text-xs fill-current text-muted-foreground">Wed</text>
                    <text x="140" y="190" className="text-xs fill-current text-muted-foreground">Thu</text>
                    <text x="180" y="190" className="text-xs fill-current text-muted-foreground">Fri</text>
                    <text x="220" y="190" className="text-xs fill-current text-muted-foreground">Sat</text>
                    <text x="260" y="190" className="text-xs fill-current text-muted-foreground">Sun</text>
                  </svg>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">₹12.5K</div>
                    <div className="text-xs text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">+23%</div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">156</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className="panel h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-background overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-balance mb-6">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Everything you need to know about Vendora
          </p>
        </div>

        <div className="w-full overflow-hidden">
          <div className="faq-scroll-container flex animate-scroll">
            {/* FAQ Cards - Duplicated for seamless loop */}
            {[
              {
                question: "How is Vendora different from Zomato or Swiggy?",
                answer: "Vendora focuses on direct vendor-customer transactions without delivery fees or commissions. Vendors keep 100% of their earnings while customers pay directly via UPI."
              },
              {
                question: "Why would small vendors adopt this platform?",
                answer: "Zero setup costs, no monthly fees, and instant digital presence. Vendors can start accepting digital orders within minutes and increase their customer reach significantly."
              },
              {
                question: "How easy is it for a vendor with low tech literacy to set up a menu?",
                answer: "Extremely simple! Just add your stall name, UPI ID, and food items with prices. Our interface is designed for non-tech users with step-by-step guidance."
              },
              {
                question: "What happens if a vendor doesn't have internet access or UPI?",
                answer: "Vendora works offline once set up. For UPI, we provide guidance to create accounts with banks or digital payment apps. No internet needed for order processing."
              },
              {
                question: "How do you ensure trust when the customer pays first?",
                answer: "Customers pay directly to vendor's UPI ID, not to Vendora. Vendors confirm payment receipt before preparing orders, ensuring transparency and trust."
              },
              {
                question: "Will you provide delivery, or is it only dine-in/pickup?",
                answer: "Currently focused on pickup/dine-in orders. Vendors can coordinate their own delivery or partner with local delivery services if needed."
              },
              {
                question: "Can vendors update menus and prices instantly?",
                answer: "Yes! Vendors can add, remove, or modify menu items and prices in real-time through their dashboard. Changes reflect immediately on customer menus."
              },
              {
                question: "What if the vendor denies or forgets to confirm an order?",
                answer: "Orders have a 15-minute confirmation window. If not confirmed, customers are notified and can reorder. Vendors can also set auto-confirm for busy periods."
              },
              {
                question: "Can customers track their order status?",
                answer: "Yes! Customers receive real-time updates: order received, payment confirmed, food being prepared, and ready for pickup."
              }
            ].map((faq, index) => (
              <div key={index} className="faq-card flex-shrink-0 mx-4">
                <Card className="p-6 w-80 h-64 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-background/80 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-foreground leading-tight mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              </div>
            ))}
            {/* Duplicate cards for seamless loop */}
            {[
              {
                question: "How is Vendora different from Zomato or Swiggy?",
                answer: "Vendora focuses on direct vendor-customer transactions without delivery fees or commissions. Vendors keep 100% of their earnings while customers pay directly via UPI."
              },
              {
                question: "Why would small vendors adopt this platform?",
                answer: "Zero setup costs, no monthly fees, and instant digital presence. Vendors can start accepting digital orders within minutes and increase their customer reach significantly."
              },
              {
                question: "How easy is it for a vendor with low tech literacy to set up a menu?",
                answer: "Extremely simple! Just add your stall name, UPI ID, and food items with prices. Our interface is designed for non-tech users with step-by-step guidance."
              },
              {
                question: "What happens if a vendor doesn't have internet access or UPI?",
                answer: "Vendora works offline once set up. For UPI, we provide guidance to create accounts with banks or digital payment apps. No internet needed for order processing."
              },
              {
                question: "How do you ensure trust when the customer pays first?",
                answer: "Customers pay directly to vendor's UPI ID, not to Vendora. Vendors confirm payment receipt before preparing orders, ensuring transparency and trust."
              },
              {
                question: "Will you provide delivery, or is it only dine-in/pickup?",
                answer: "Currently focused on pickup/dine-in orders. Vendors can coordinate their own delivery or partner with local delivery services if needed."
              },
              {
                question: "Can vendors update menus and prices instantly?",
                answer: "Yes! Vendors can add, remove, or modify menu items and prices in real-time through their dashboard. Changes reflect immediately on customer menus."
              },
              {
                question: "What if the vendor denies or forgets to confirm an order?",
                answer: "Orders have a 15-minute confirmation window. If not confirmed, customers are notified and can reorder. Vendors can also set auto-confirm for busy periods."
              },
              {
                question: "Can customers track their order status?",
                answer: "Yes! Customers receive real-time updates: order received, payment confirmed, food being prepared, and ready for pickup."
              }
            ].map((faq, index) => (
              <div key={`duplicate-${index}`} className="faq-card flex-shrink-0 mx-4">
                <Card className="p-6 w-80 h-64 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-background/80 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-foreground leading-tight mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white">Vendora</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Digitizing Indian Street Food Commerce. Empowering vendors with digital menus, QR code ordering, and seamless UPI payments.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.01 2.163c3.204 0 3.584.012 4.849.07 3.163.169 4.771 1.699 4.919 4.92.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* For Vendors */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Partner With Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Setup Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Support</a></li>
              </ul>
            </div>

            {/* For Customers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">How It Works</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Find Vendors</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Help Center</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Careers</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 md:mb-0">
                By continuing past this page, you agree to our{" "}
                <a href="#" className="text-white hover:underline">Terms of Service</a>,{" "}
                <a href="#" className="text-white hover:underline">Privacy Policy</a>, and{" "}
                <a href="#" className="text-white hover:underline">Cookie Policy</a>.
              </div>
              <div className="text-sm text-gray-400">
                All trademarks are properties of their respective owners.{" "}
                <span className="text-white">© 2025 Vendora™ Ltd. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
