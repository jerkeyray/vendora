"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
  CheckCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
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
            <Button variant="outline" size="sm">
              Login
            </Button>
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
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
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
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-8 bg-transparent"
              >
                Schedule Demo
              </Button>
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
