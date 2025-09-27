"use client";

import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SignInButton } from "@/components/auth/SignInButton";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Search,
  Package,
  Store,
  ClipboardCheck,
  Bell,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: session, isPending } = useSession();
  const [onboardingStatus, setOnboardingStatus] = useState<
    "loading" | "complete" | "needed"
  >("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const orderTrackingRef = useRef<HTMLDivElement>(null);
  const vendorSectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Check onboarding status when user is authenticated
  useEffect(() => {
    if (!session?.user?.email) {
      setOnboardingStatus("needed");
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch(
          `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await response.json();

        if (data.onboardingComplete) {
          setOnboardingStatus("complete");
        } else {
          setOnboardingStatus("needed");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setOnboardingStatus("needed");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email]);

  // Determine the correct redirect URL for authenticated users
  const getDashboardUrl = () => {
    if (onboardingStatus === "loading") {
      return "#"; // Prevent navigation while loading
    }
    if (onboardingStatus === "complete") {
      return "/dashboard";
    }
    return "/onboarding";
  };

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
            trigger: analyticsRef.current,
            start: "top 100px",
            toggleActions: "play none none reverse",
          },
        });
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
            strokeDashoffset: "1000",
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
        ScrollTrigger.create({
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
                d: `M20,${160 + waveOffset} Q60,${120 + waveOffset} 100,${
                  100 + waveOffset
                } T180,${80 + waveOffset} T260,${60 + waveOffset}`,
              },
            });

            // Apply same wave to data points
            const circles = document.querySelectorAll(
              "#analytics-line + circle"
            );
            circles.forEach((circle, index) => {
              const baseY = [160, 120, 100, 90, 80, 70, 60][index];
              gsap.set(circle, {
                attr: {
                  cy: baseY + waveOffset,
                },
              });
            });
          },
        });
      }

      // Hero section scroll animations - move only image to right
      if (heroRef.current && analyticsRef.current) {
        // Move hero image to right extremity
        gsap.to(".hero-image-content", {
          x: 200,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: analyticsRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });
      }

      // Order tracking section animation
      gsap.fromTo(
        ".order-tracking-content",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: orderTrackingRef.current,
            start: "top 80%",
          },
        }
      );

      // Vendor section animation
      gsap.fromTo(
        ".vendor-section-content",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: vendorSectionRef.current,
            start: "top 80%",
          },
        }
      );

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
              href="#track-order"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Track Order
            </a>
            <a
              href="#vendor-dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              For Vendors
            </a>
            <a
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
            <Link
              href="/stores"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Stores
            </Link>
            {!isPending && (
              <div>
                {session ? (
                  <Link href={getDashboardUrl()}>
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
                  <Spinner size="sm" variant="white" />
                </Button>
              ) : session ? (
                <Link href={getDashboardUrl()}>
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
          <div
            ref={imageRef}
            className="hero-image-content flex justify-center lg:justify-end"
          >
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
                Analytics that <span className="text-primary">accelerate</span>{" "}
                your business
              </h2>
              <p className="analytics-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 text-pretty">
                Transform your street food business with powerful insights.
                Track sales, analyze trends, and make data-driven decisions that
                boost your revenue.
              </p>
            </div>

            {/* Right side - Analytics Graph */}
            <div className="analytics-graph flex justify-center lg:justify-end">
              <div className="w-full max-w-lg bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-center mb-2">
                    Sales Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Last 7 days performance
                  </p>
                </div>

                {/* Moving Graph */}
                <div className="relative h-64 bg-background rounded-lg p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    <defs>
                      <pattern
                        id="grid"
                        width="30"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 30 0 L 0 0 0 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-muted-foreground/20"
                        />
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
                    <circle
                      cx="20"
                      cy="160"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="60"
                      cy="120"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="140"
                      cy="90"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="180"
                      cy="80"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="220"
                      cy="70"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />
                    <circle
                      cx="260"
                      cy="60"
                      r="4"
                      fill="currentColor"
                      className="text-green-500"
                    />

                    {/* Labels */}
                    <text
                      x="20"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Mon
                    </text>
                    <text
                      x="60"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Tue
                    </text>
                    <text
                      x="100"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Wed
                    </text>
                    <text
                      x="140"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Thu
                    </text>
                    <text
                      x="180"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Fri
                    </text>
                    <text
                      x="220"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Sat
                    </text>
                    <text
                      x="260"
                      y="190"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      Sun
                    </text>
                  </svg>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ₹12.5K
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Sales
                    </div>
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

      {/* Order Tracking Section */}
      <section
        ref={orderTrackingRef}
        id="track-order"
        className="panel h-screen flex items-center justify-center bg-gradient-to-br from-muted/20 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="order-tracking-content max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-balance mb-4">
                Track Your <span className="text-primary">Order</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Enter your order number to check the status and get real-time
                updates.
              </p>
            </div>

            <Card className="p-8 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="orderNumber"
                    className="text-sm font-medium text-left block"
                  >
                    Order Number
                  </label>
                  <div className="flex gap-3">
                    <Input
                      id="orderNumber"
                      type="text"
                      placeholder="Enter your order number (e.g., ORD123456)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="flex-1 text-center font-mono"
                    />
                    <Button
                      onClick={() => {
                        if (orderNumber.trim()) {
                          window.location.href = `/order/${orderNumber.trim()}`;
                        }
                      }}
                      disabled={!orderNumber.trim()}
                      className="px-6"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Your order number was provided when you placed your order.
                  </p>
                  <p>
                    It typically starts with &ldquo;ORD&rdquo; followed by
                    numbers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">Order Placed</div>
                    <div className="text-xs text-muted-foreground">
                      Payment pending
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium">Confirmed</div>
                    <div className="text-xs text-muted-foreground">
                      Being prepared
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">Ready</div>
                    <div className="text-xs text-muted-foreground">
                      Ready for pickup
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <Link
                href="/stores"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Don&apos;t have an order? Browse available stores →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Dashboard Section */}
      <section
        ref={vendorSectionRef}
        id="vendor-dashboard"
        className="panel h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="vendor-section-content max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-balance mb-4">
                Vendor <span className="text-primary">Dashboard</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Manage your orders, confirm payments, and track your business
                all in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Order Management Card */}
              <Card className="p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Order Management</h3>
                    <p className="text-muted-foreground mb-4">
                      View incoming orders, confirm or reject them, and manage
                      your order queue in real-time.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Confirm or reject orders instantly
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Track order status and customer details
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Generate token numbers for pickup
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Real-time Notifications */}
              <Card className="p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Real-time Notifications
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Get instant alerts for new orders, payment confirmations,
                      and customer interactions.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Instant new order alerts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Payment confirmation updates
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Customer feedback and ratings
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Buttons for Vendors */}
            <div className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {isPending ? (
                  <Button size="lg" disabled>
                    <Spinner size="sm" variant="white" />
                  </Button>
                ) : session ? (
                  <>
                    <Link href={getDashboardUrl()}>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                      >
                        <Store className="mr-2 w-4 h-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link
                      href={
                        onboardingStatus === "complete"
                          ? "/orders"
                          : "/dashboard"
                      }
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="font-semibold px-8"
                      >
                        <ClipboardCheck className="mr-2 w-4 h-4" />
                        Manage Orders
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <SignInButton />
                    <Button
                      variant="outline"
                      size="lg"
                      className="font-semibold px-8"
                    >
                      <Store className="mr-2 w-4 h-4" />
                      Start Selling
                    </Button>
                  </>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Already a vendor? Sign in to access your dashboard and start
                  managing orders.
                </p>
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
                  <Spinner size="sm" variant="white" />
                </Button>
              ) : session ? (
                <Link href={getDashboardUrl()}>
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

      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white">Vendora</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Digitizing Indian Street Food Commerce. Empowering vendors with
                digital menus, QR code ordering, and seamless UPI payments.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.01 2.163c3.204 0 3.584.012 4.849.07 3.163.169 4.771 1.699 4.919 4.92.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* For Vendors */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Partner With Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Setup Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* For Customers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Find Vendors
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 md:mb-0">
                By continuing past this page, you agree to our{" "}
                <a href="#" className="text-white hover:underline">
                  Terms of Service
                </a>
                ,{" "}
                <a href="#" className="text-white hover:underline">
                  Privacy Policy
                </a>
                , and{" "}
                <a href="#" className="text-white hover:underline">
                  Cookie Policy
                </a>
                .
              </div>
              <div className="text-sm text-gray-400">
                All trademarks are properties of their respective owners.{" "}
                <span className="text-white">
                  © 2025 Vendora™ Ltd. All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
