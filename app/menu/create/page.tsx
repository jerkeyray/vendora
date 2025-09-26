"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChefHat, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function MenuCreatePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

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
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        router.push("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, router]);

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
    <main className="min-h-screen bg-background">
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-6">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="p-6">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                Menu Creator
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Create and manage your food menu items
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="py-12">
                <p className="text-xl text-muted-foreground mb-6">
                  Menu creation functionality is coming soon!
                </p>
                <p className="text-muted-foreground">
                  You&apos;ll be able to add food items, set prices, upload
                  images, and organize your menu here.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="px-8 py-3"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
