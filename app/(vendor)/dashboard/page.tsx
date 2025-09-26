"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { ShoppingBag, IndianRupee } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch(
          `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await response.json();

        if (!data.onboardingComplete) {
          // Clear any cached onboarding data and redirect
          if (typeof window !== "undefined") {
            localStorage.removeItem("vendora_onboarding_data");
          }
          redirect("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, redirect to onboarding to be safe
        redirect("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Header is provided by (vendor)/layout.tsx */}

      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Quick Stats */}
            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">0</div>
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>

            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
                <IndianRupee className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">₹0</div>
                <p className="text-sm text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="p-2">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Welcome to Your Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Track your orders and revenue from this central hub. More
                features coming soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
