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
  Smartphone,
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
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
  const featuresRef = useRef<HTMLDivElement>(null);
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
            trigger: featuresRef.current,
            start: "top 100px",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Feature cards animation
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
        }
      );

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
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
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
        className="panel h-screen flex items-center"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-balance mb-4">
              Everything Your <span className="text-primary">Stall</span> Needs
              to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simple, powerful tools designed specifically for Indian street
              vendors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="feature-card p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">QR Code Menu</h3>
              <p className="text-muted-foreground">
                Customers scan a QR code to view your menu and place orders
                instantly.
              </p>
            </Card>

            <Card className="feature-card p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seamless UPI Payments</h3>
              <p className="text-muted-foreground">
                Accept payments directly through any UPI app, hassle-free.
              </p>
            </Card>

            <Card className="feature-card p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Manual Order Confirmation
              </h3>
              <p className="text-muted-foreground">
                You have full control to confirm or reject orders as they come
                in.
              </p>
            </Card>

            <Card className="feature-card p-6 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-primary/5">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sales Analytics</h3>
              <p className="text-muted-foreground">
                Track daily sales and popular items with simple reports.
              </p>
            </Card>
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
