"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ChefHat,
  QrCode,
  Edit,
  Download,
  TrendingUp,
  Calendar,
  ClipboardCheck,
  Package,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [storeData, setStoreData] = useState<{ name?: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [storeURL, setStoreURL] = useState<string>("");
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    todayTotal: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Get store data
  const getStoreData = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const onboardingResponse = await fetch(
        `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
      );

      const onboardingData = await onboardingResponse.json();

      if (onboardingData.store) {
        setStoreData(onboardingData.store);
      }
    } catch (error) {
      console.error("Error checking menu items:", error);
    } finally {
      setIsLoadingStore(false);
    }
  }, [session?.user?.email]);

  // Load QR code
  const loadQRCode = useCallback(async () => {
    if (!session?.user?.email) return;

    setIsLoadingQR(true);
    try {
      const response = await fetch(
        `/api/store/qr-code?email=${encodeURIComponent(session.user.email)}`
      );
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setStoreURL(data.storeURL);
      }
    } catch (error) {
      console.error("Error loading QR code:", error);
    } finally {
      setIsLoadingQR(false);
    }
  }, [session?.user?.email]);

  // Generate new QR code
  const regenerateQRCode = async () => {
    if (!session?.user?.email) return;

    setIsLoadingQR(true);
    try {
      const response = await fetch("/api/store/qr-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          regenerate: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setStoreURL(data.storeURL);
      }
    } catch (error) {
      console.error("Error regenerating QR code:", error);
    } finally {
      setIsLoadingQR(false);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCode || !storeData?.name) return;

    const link = document.createElement("a");
    link.download = `${storeData.name}-qr-code.png`;
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View menu
  const viewMenu = () => {
    if (storeURL) {
      window.open(storeURL, "_blank");
    } else if (storeData?.name) {
      // If no storeURL but we have store data, try to construct the URL
      // This will trigger QR code generation if needed
      loadQRCode();
    }
  };

  // Fetch order statistics
  const fetchOrderStats = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
        `/api/orders/vendor?email=${encodeURIComponent(session.user.email)}`
      );

      if (response.ok) {
        const data = await response.json();
        const orders = data.orders;

        // Get today's date
        const today = new Date().toDateString();

        // Calculate today's orders and revenue
        const todayOrders = orders.all.filter(
          (order: { createdAt: string }) =>
            new Date(order.createdAt).toDateString() === today
        );

        const todayRevenue = todayOrders.reduce(
          (sum: number, order: { totalAmount: string | number }) =>
            sum + parseFloat(order.totalAmount.toString()),
          0
        );

        setOrderStats({
          pending: orders.pending.length,
          todayTotal: todayOrders.length,
          todayRevenue: todayRevenue,
        });
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  }, [session?.user?.email]);

  // Load QR code when store data is available
  useEffect(() => {
    if (storeData && session?.user?.email) {
      loadQRCode();
      fetchOrderStats();
    }
  }, [storeData, session?.user?.email, loadQRCode, fetchOrderStats]);

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
          // Get store data
          getStoreData();
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, redirect to onboarding to be safe
        router.push("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, router, getStoreData]);

  if (isPending || isLoadingStore) {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Orders
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats.todayTotal}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orderStats.todayTotal === 0
                    ? "No orders today"
                    : orderStats.todayTotal === 1
                    ? "1 order today"
                    : `${orderStats.todayTotal} orders today`}
                </p>
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
                <div className="text-2xl font-bold">
                  ₹{orderStats.todayRevenue}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orderStats.todayRevenue === 0
                    ? "No sales today"
                    : "Total earnings today"}
                </p>
              </CardContent>
            </Card>

            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/orders")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {orderStats.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orderStats.pending === 0
                    ? "No pending orders"
                    : orderStats.pending === 1
                    ? "1 order needs attention"
                    : `${orderStats.pending} orders need attention`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Your QR Code</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Share with customers to view your menu
                  </p>

                  {isLoadingQR && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Spinner className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Updating...
                      </span>
                    </div>
                  )}
                </div>

                {storeURL ? (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Store URL:
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono break-all flex-1">
                        {storeURL}
                      </p>
                      <Button
                        onClick={() => navigator.clipboard.writeText(storeURL)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Copy URL"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Store URL will appear here once generated
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={downloadQRCode}
                    disabled={!qrCode || isLoadingQR}
                    className="flex-1"
                    size="lg"
                  >
                    <Download className="mr-2 w-4 h-4" />
                    Download QR
                  </Button>
                  <Button
                    onClick={viewMenu}
                    disabled={!storeURL}
                    variant="outline"
                    size="lg"
                  >
                    Visit Store
                  </Button>
                </div>

                {!qrCode && !isLoadingQR && (
                  <Button
                    onClick={regenerateQRCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Generate QR Code
                  </Button>
                )}

                {!storeURL && !isLoadingQR && qrCode && (
                  <Button
                    onClick={loadQRCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Load Store URL
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Menu Management */}
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-3">Menu Management</CardTitle>
              <p className="text-muted-foreground mb-8">
                Update your menu items and prices
              </p>
              <Button
                onClick={() => router.push("/menu/builder")}
                className="w-full max-w-xs"
                size="lg"
              >
                <Edit className="mr-2 w-4 h-4" />
                Edit Menu
              </Button>
            </Card>

            {/* Orders Management */}
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardCheck className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-3">Orders Management</CardTitle>
              <p className="text-muted-foreground mb-8">
                Accept orders and manage your queue
              </p>
              <Button
                onClick={() => router.push("/orders")}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Package className="mr-2 w-4 h-4" />
                Manage Orders
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
