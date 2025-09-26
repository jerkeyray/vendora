"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  ChefHat,
  Plus,
  QrCode,
  Edit,
  Download,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [hasMenuItems, setHasMenuItems] = useState<boolean | null>(null);
  const [isCheckingMenu, setIsCheckingMenu] = useState(true);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [storeData, setStoreData] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Check menu items and get store data
  const checkMenuItems = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const [menuResponse, onboardingResponse] = await Promise.all([
        fetch(`/api/menu/get?email=${encodeURIComponent(session.user.email)}`),
        fetch(
          `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
        ),
      ]);

      const menuData = await menuResponse.json();
      const onboardingData = await onboardingResponse.json();

      if (menuData.success && menuData.menuItems) {
        setHasMenuItems(menuData.menuItems.length > 0);
        setMenuItemsCount(menuData.menuItems.length);
      } else {
        setHasMenuItems(false);
        setMenuItemsCount(0);
      }

      if (onboardingData.store) {
        setStoreData(onboardingData.store);
      }
    } catch (error) {
      console.error("Error checking menu items:", error);
      setHasMenuItems(false);
      setMenuItemsCount(0);
    } finally {
      setIsCheckingMenu(false);
    }
  }, [session?.user?.email]);

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
          router.push("/onboarding");
        } else {
          // Check if vendor has menu items
          checkMenuItems();
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, redirect to onboarding to be safe
        router.push("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, router, checkMenuItems]);

  if (isPending || isCheckingMenu) {
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
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {storeData?.name || "Your Store"}
            </h1>
          </div>

          {/* Today's Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Orders
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No orders today</p>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-muted-foreground">No sales today</p>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Menu Items
                </CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{menuItemsCount}</div>
                <p className="text-xs text-muted-foreground">Items available</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* QR Code Section */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Your QR Code</CardTitle>
                    <p className="text-muted-foreground">
                      Share with customers to view your menu
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      QR Code Preview
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" size="lg">
                    <Download className="mr-2 w-4 h-4" />
                    Download QR
                  </Button>
                  <Button variant="outline" size="lg">
                    <QrCode className="mr-2 w-4 h-4" />
                    View Menu
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Menu Management */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Menu Management</CardTitle>
                    <p className="text-muted-foreground">
                      Update your menu items and prices
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {menuItemsCount}
                    </div>
                    <p className="text-muted-foreground">Menu Items</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">1</div>
                    <p className="text-muted-foreground">Sections</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/menu/builder")}
                    className="flex-1"
                    size="lg"
                  >
                    <Edit className="mr-2 w-4 h-4" />
                    Edit Menu
                  </Button>
                  <Button
                    onClick={() => router.push("/menu/builder")}
                    variant="outline"
                    size="lg"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Add Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <p className="text-muted-foreground">
                Your latest orders and updates
              </p>
            </CardHeader>
            <CardContent>
              {hasMenuItems === false ? (
                <div className="text-center py-12">
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Create your menu first
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Add your food items to start receiving orders from customers
                  </p>
                  <Button
                    onClick={() => router.push("/menu/builder")}
                    size="lg"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Create Menu
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Share your QR code with customers to start receiving orders
                  </p>
                  <Button variant="outline">
                    <Download className="mr-2 w-4 h-4" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
