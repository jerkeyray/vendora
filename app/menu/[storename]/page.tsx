"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart, User, Phone } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
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

interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function OrderPage() {
  const params = useParams();
  const storeSlug = params.storename as string;

  const [menu, setMenu] = useState<Menu | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const fetchStoreAndMenu = async () => {
      try {
        setLoading(true);

        // First fetch store by slug
        const storeResponse = await fetch(
          `/api/store/get-by-slug?slug=${encodeURIComponent(storeSlug)}`
        );
        if (!storeResponse.ok) {
          throw new Error("Store not found");
        }
        const storeData = await storeResponse.json();

        if (!storeData.store) {
          throw new Error("Store not found");
        }

        setStore(storeData.store);

        // Then fetch menu for this store
        const menuResponse = await fetch(
          `/api/menu/get-by-store?storeId=${storeData.store.id}`
        );
        if (!menuResponse.ok) {
          throw new Error("Menu not found");
        }
        const menuData = await menuResponse.json();

        setMenu(menuData.menu);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load store");
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) {
      fetchStoreAndMenu();
    }
  }, [storeSlug]);

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.menuItem.id === menuItem.id
      );
      if (existingItem) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.menuItem.id === menuItemId);
      if (!existingItem) return prev;

      if (existingItem.quantity === 1) {
        return prev.filter((item) => item.menuItem.id !== menuItemId);
      }

      return prev.map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const getCartItemQuantity = (menuItemId: string) => {
    const item = cart.find((item) => item.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        storeId: store?.id,
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
        totalAmount: getTotalAmount(),
        customerPhone: customerPhone || undefined,
        customerName: customerName || undefined,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const result = await response.json();

      // Redirect to UPI payment
      const upiUrl = `upi://pay?pa=${
        result.vendor.upiId
      }&pn=${encodeURIComponent(
        store?.name || "Store"
      )}&am=${getTotalAmount()}&cu=INR&tn=${encodeURIComponent(
        `Order ${result.order.orderNumber}`
      )}`;

      // For mobile devices, try to open UPI app
      if (
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        window.location.href = upiUrl;
      } else {
        // For desktop, show UPI ID
        alert(
          `Please pay ₹${getTotalAmount()} to UPI ID: ${
            result.vendor.upiId
          }\nOrder Number: ${result.order.orderNumber}`
        );
      }

      // Clear cart after payment initiation
      setCart([]);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to process payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !store || !menu) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">
                  Vendora
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Store Not Found
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {error ||
                  "The store you are looking for does not exist or is currently unavailable."}
              </p>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Looking for a specific store? Make sure the store name in the
                URL is correct, or contact the vendor for the correct link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {store.name}
              </h1>
              {store.address && (
                <p className="text-sm text-muted-foreground">{store.address}</p>
              )}
            </div>
            {cart.length > 0 && (
              <Button
                onClick={() =>
                  document
                    .getElementById("cart")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="relative"
                variant="outline"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({getTotalItems()})
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">{menu.name}</h2>

            {menu.categories.map((category) => (
              <div key={category.id} className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-primary">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.menuItems
                    .filter((item) => item.isAvailable)
                    .map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground">
                                  {item.name}
                                </h4>
                                <Badge
                                  variant={
                                    item.isVeg ? "secondary" : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {item.isVeg ? "VEG" : "NON-VEG"}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-lg font-semibold text-primary">
                                ₹{item.price}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {getCartItemQuantity(item.id) === 0 ? (
                              <Button
                                onClick={() => addToCart(item)}
                                size="sm"
                                className="ml-auto"
                              >
                                Add to Cart
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 ml-auto">
                                <Button
                                  onClick={() => removeFromCart(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium min-w-[2rem] text-center">
                                  {getCartItemQuantity(item.id)}
                                </span>
                                <Button
                                  onClick={() => addToCart(item)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card id="cart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cart.map((item) => (
                          <div
                            key={item.menuItem.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {item.menuItem.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.menuItem.price} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => removeFromCart(item.menuItem.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() => addToCart(item.menuItem)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="space-y-4 mb-4">
                          <div>
                            <Label
                              htmlFor="customerPhone"
                              className="text-sm font-medium flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              Phone Number (Optional)
                            </Label>
                            <Input
                              id="customerPhone"
                              type="tel"
                              placeholder="Enter phone number"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="customerName"
                              className="text-sm font-medium flex items-center gap-1"
                            >
                              <User className="h-3 w-3" />
                              Name (Optional)
                            </Label>
                            <Input
                              id="customerName"
                              type="text"
                              placeholder="Enter your name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">
                            ₹{getTotalAmount()}
                          </span>
                        </div>

                        <Button
                          onClick={handlePayment}
                          className="w-full"
                          size="lg"
                        >
                          Pay with UPI
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
