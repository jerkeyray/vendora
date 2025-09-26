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

        // Moving graph animation with heartbeat pulse
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

        // Data points animation with heartbeat pulse
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

        // Heartbeat pulse animation for graph peaks (runs for initial 8 seconds then stops)
        const heartbeatTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: analyticsRef.current,
            start: "top 60%",
          }
        });

        // Create heartbeat pulse effect on data points
        heartbeatTimeline.to("#analytics-line + circle", {
          scale: 1.2,
          duration: 0.3,
          ease: "power2.inOut",
          stagger: 0.1,
          repeat: 15, // Repeat for about 8 seconds (15 * 0.3 * 2 = 9 seconds)
          yoyo: true,
        });

        // Add subtle pulse to the line itself
        heartbeatTimeline.to("#analytics-line", {
          strokeWidth: 4,
          duration: 0.3,
          ease: "power2.inOut",
          repeat: 15,
          yoyo: true,
        }, 0); // Start at the same time as circles
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
          <div className="text-center lg:text-left">
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
          <div ref={imageRef} className="flex justify-center lg:justify-end">
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
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                    <span className="text-3xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-center">Vendor Setup</h3>
                  <p className="text-muted-foreground text-center text-lg max-w-2xl">
                    Create your digital menu, add your stall details and UPI ID. 
                    Get your unique QR code to display at your stall.
                  </p>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="step-card flex-shrink-0 w-screen px-8">
                <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                    <span className="text-3xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-center">Customer Orders</h3>
                  <p className="text-muted-foreground text-center text-lg max-w-2xl">
                    Customers scan your QR code, browse your menu, add items to cart, 
                    and pay directly through their UPI app.
                  </p>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="step-card flex-shrink-0 w-screen px-8">
                <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                    <span className="text-3xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-center">Order Confirmation</h3>
                  <p className="text-muted-foreground text-center text-lg max-w-2xl">
                    Customer confirms payment completion. You receive the order notification 
                    and manually confirm or reject based on your UPI payment confirmation.
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
                We Don't Just Do <span className="text-primary">Business</span>,<br />
                We Do <span className="text-primary">Analytics</span>
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
                      className="text-primary"
                    />
                    
                    {/* Data points */}
                    <circle cx="20" cy="160" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="60" cy="120" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="100" cy="100" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="140" cy="90" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="180" cy="80" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="220" cy="70" r="4" fill="currentColor" className="text-primary" />
                    <circle cx="260" cy="60" r="4" fill="currentColor" className="text-primary" />
                    
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
        className="panel h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="cta-content max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-balance mb-6">
              Ready to <span className="text-primary">Digitize</span> Your
              Stall?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Join thousands of street vendors who have transformed their
              business with Vendora.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
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
                <>
                  <SignInButton />
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-semibold px-8 bg-transparent"
                  >
                    Schedule Demo
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="text-xl font-bold text-foreground">
                  Vendora
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Digitizing Indian Street Food Commerce.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 Vendora. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
