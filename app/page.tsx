"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useSession } from "@/lib/auth-client";
import { QrCode, CreditCard, BarChart3 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vendora</h1>
          {!isPending && (
            <div>{session ? <SignOutButton /> : <SignInButton />}</div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Digitize Your Street Food Business
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Transform your traditional food stall with QR code menus, digital
              ordering, and seamless UPI payments. Start accepting orders
              digitally today.
            </p>

            {/* Conditional CTA */}
            <div className="mb-16">
              {isPending ? (
                <Button size="lg" disabled>
                  Loading...
                </Button>
              ) : session ? (
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <SignInButton />
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <QrCode className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">QR Code Menus</h3>
                  <p className="text-muted-foreground">
                    Customers scan and order instantly. No app downloads
                    required.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <CreditCard className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">UPI Payments</h3>
                  <p className="text-muted-foreground">
                    Accept payments through any UPI app. Fast and secure
                    transactions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <BarChart3 className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Sales Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Track your daily sales and popular items with detailed
                    insights.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Vendora. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Digitizing Indian Street Food
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
