"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Minus,
  Plus,
  ShoppingCart,
  User,
  Phone,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    orderNumber: string;
    upiId: string;
    amount: number;
    storeName: string;
  } | null>(null);

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

      // Store order number in localStorage for tracking
      localStorage.setItem("currentOrderNumber", result.order.orderNumber);

      // Set payment info and show modal
      setPaymentInfo({
        orderNumber: result.order.orderNumber,
        upiId: result.vendor.upiId,
        amount: getTotalAmount(),
        storeName: store?.name || "Store",
      });
      setShowPaymentModal(true);

      // For mobile devices, try to open UPI app
      if (
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        // Open UPI app
        window.location.href = upiUrl;
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
        {/* Error Content */}
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
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
      {/* Mobile Cart Button - Fixed position for easy access */}
      {cart.length > 0 && (
        <div className="fixed top-4 right-4 z-50 lg:hidden">
          <Button
            onClick={() =>
              document
                .getElementById("cart")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative shadow-lg"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {getTotalItems()}
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Store Header */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {store.name}
          </h1>
          {store.description && (
            <p className="text-muted-foreground mb-2">{store.description}</p>
          )}
          {store.address && (
            <p className="text-sm text-muted-foreground">{store.address}</p>
          )}
          <div className="h-1 w-20 bg-primary rounded-full mx-auto lg:mx-0 mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {menu.categories.map((category) => (
              <div key={category.id} className="mb-10">
                <div className="sticky top-4 bg-background/95 backdrop-blur-sm z-10 py-3 mb-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <div className="w-2 h-6 bg-primary rounded-full"></div>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground mt-2 ml-5">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {category.menuItems
                    .filter((item) => item.isAvailable)
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30"
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center">
                            {/* Menu Item Content */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div
                                      className={`w-3 h-3 rounded-full border-2 ${
                                        item.isVeg
                                          ? "border-green-500 bg-green-500"
                                          : "border-red-500 bg-red-500"
                                      }`}
                                    ></div>
                                    <h4 className="font-semibold text-lg text-foreground">
                                      {item.name}
                                    </h4>
                                  </div>
                                  {item.description && (
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-3 ml-6">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="ml-6">
                                    <span className="text-xl font-bold text-primary">
                                      ₹{item.price}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Add to Cart Section */}
                            <div className="p-4 border-l border-border bg-muted/20">
                              <div className="flex flex-col items-center justify-center min-w-[100px]">
                                {getCartItemQuantity(item.id) === 0 ? (
                                  <Button
                                    onClick={() => addToCart(item)}
                                    size="sm"
                                    className="w-full font-medium"
                                  >
                                    Add
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => removeFromCart(item.id)}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 rounded-full"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="font-bold text-lg min-w-[2rem] text-center">
                                      {getCartItemQuantity(item.id)}
                                    </span>
                                    <Button
                                      onClick={() => addToCart(item)}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 rounded-full"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-8">
              <Card id="cart" className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    Your Order
                    {cart.length > 0 && (
                      <Badge className="ml-auto">
                        {getTotalItems()} item{getTotalItems() > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Your cart is empty
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add items to get started
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.menuItem.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.menuItem.isVeg
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item.menuItem.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                  ₹{item.menuItem.price} each
                                </p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() =>
                                      removeFromCart(item.menuItem.id)
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 rounded-full"
                                  >
                                    <Minus className="h-2 w-2" />
                                  </Button>
                                  <span className="text-sm font-bold min-w-[1rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    onClick={() => addToCart(item.menuItem)}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 rounded-full"
                                  >
                                    <Plus className="h-2 w-2" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Amount</span>
                            <span className="font-bold text-xl text-primary">
                              ₹{getTotalAmount()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label
                              htmlFor="customerPhone"
                              className="text-xs font-medium flex items-center gap-1 text-muted-foreground"
                            >
                              <Phone className="h-3 w-3" />
                              Phone (Optional)
                            </Label>
                            <Input
                              id="customerPhone"
                              type="tel"
                              placeholder="Your phone number"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="customerName"
                              className="text-xs font-medium flex items-center gap-1 text-muted-foreground"
                            >
                              <User className="h-3 w-3" />
                              Name (Optional)
                            </Label>
                            <Input
                              id="customerName"
                              type="text"
                              placeholder="Your name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handlePayment}
                          className="w-full font-semibold"
                          size="lg"
                        >
                          Pay ₹{getTotalAmount()} with UPI
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Order Placed Successfully!
            </DialogTitle>
          </DialogHeader>

          {paymentInfo && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Order Number
                </div>
                <div className="font-mono text-lg font-bold">
                  {paymentInfo.orderNumber}
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="text-sm font-medium">Payment Details:</div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">UPI ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {paymentInfo.upiId}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        navigator.clipboard.writeText(paymentInfo.upiId)
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Amount:</span>
                  <span className="font-bold text-primary">
                    ₹{paymentInfo.amount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Store:</span>
                  <span className="font-medium">{paymentInfo.storeName}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                )
                  ? "Your UPI app should have opened automatically. Complete the payment and return here."
                  : "Please pay using any UPI app with the above details."}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentModal(false);
                    window.location.href = `/order/${paymentInfo.orderNumber}`;
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track Order
                </Button>

                {!/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const upiUrl = `upi://pay?pa=${
                        paymentInfo.upiId
                      }&pn=${encodeURIComponent(paymentInfo.storeName)}&am=${
                        paymentInfo.amount
                      }&cu=INR&tn=${encodeURIComponent(
                        `Order ${paymentInfo.orderNumber}`
                      )}`;
                      window.location.href = upiUrl;
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open UPI
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
