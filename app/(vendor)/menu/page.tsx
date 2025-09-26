"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Edit, Plus, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  isVeg: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  categories: Category[];
}

export default function MenuPreviewPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const loadMenu = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        // Load menu data
        const menuResponse = await fetch(
          `/api/menu/get?email=${encodeURIComponent(session.user.email)}`
        );
        const menuData = await menuResponse.json();

        // Load store data to get slug
        const storeResponse = await fetch(
          `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
        );
        const storeData = await storeResponse.json();

        if (menuData.menu) {
          setMenu(menuData.menu);
        } else {
          setError("No menu found");
        }

        if (storeData.store?.slug) {
          setStoreSlug(storeData.store.slug);
        }
      } catch (err) {
        setError("Failed to load menu");
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      loadMenu();
    }
  }, [session?.user?.email]);

  const getTotalItems = () => {
    if (!menu) return 0;
    return menu.categories.reduce(
      (total, category) => total + category.menuItems.length,
      0
    );
  };

  const getAvailableItems = () => {
    if (!menu) return 0;
    return menu.categories.reduce(
      (total, category) =>
        total + category.menuItems.filter((item) => item.isAvailable).length,
      0
    );
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error || !menu) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-8">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">No Menu Yet</h1>
              <p className="text-muted-foreground text-lg mb-8">
                You haven&apos;t created a menu yet. Start building your menu to
                showcase your delicious offerings!
              </p>
              <Button
                onClick={() => router.push("/menu/builder")}
                size="lg"
                className="px-8"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create Your First Menu
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{menu.name}</h1>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <span>{menu.categories.length} categories</span>
                  <span>{getTotalItems()} total items</span>
                  <span>{getAvailableItems()} available</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/menu/builder")}
                  variant="outline"
                  size="lg"
                >
                  <Edit className="mr-2 w-4 h-4" />
                  Edit Menu
                </Button>
                <Button
                  onClick={() => {
                    if (storeSlug) {
                      window.open(
                        `${window.location.origin}/menu/${storeSlug}`,
                        "_blank"
                      );
                    } else {
                      alert(
                        "Store slug not found. Please ensure your store is properly set up."
                      );
                    }
                  }}
                  disabled={!storeSlug}
                  size="lg"
                >
                  <Eye className="mr-2 w-4 h-4" />
                  Customer View
                </Button>
              </div>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="space-y-8">
            {menu.categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-primary rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {category.menuItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No items in this category yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.menuItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border transition-all ${
                            item.isAvailable
                              ? "bg-background border-border"
                              : "bg-muted/50 border-muted opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div
                                  className={`w-3 h-3 rounded-full border-2 ${
                                    item.isVeg
                                      ? "border-green-500 bg-green-500"
                                      : "border-red-500 bg-red-500"
                                  }`}
                                ></div>
                                <h4 className="font-semibold text-lg">
                                  {item.name}
                                </h4>
                              </div>
                              {item.description && (
                                <p className="text-muted-foreground text-sm mb-2 ml-6">
                                  {item.description}
                                </p>
                              )}
                              <div className="ml-6 flex items-center gap-2">
                                <span className="text-xl font-bold text-primary">
                                  ₹{item.price}
                                </span>
                                {!item.isAvailable && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {menu.categories.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-6">
                Start organizing your menu by creating categories
              </p>
              <Button
                onClick={() => router.push("/menu/builder")}
                size="lg"
                className="px-8"
              >
                <Edit className="mr-2 w-4 h-4" />
                Edit Menu
              </Button>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
