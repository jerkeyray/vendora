"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Minus, Plus, ShoppingCart, User, Phone } from "lucide-react";
import { CartItem, MenuItem } from "../types";

interface CartSidebarProps {
  cart: CartItem[];
  onAddToCart: (menuItem: MenuItem) => void;
  onRemoveFromCart: (menuItemId: string) => void;
  onPayment: (customerPhone: string, customerName: string) => Promise<void>;
}

export function CartSidebar({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onPayment,
}: CartSidebarProps) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

    setIsProcessingPayment(true);
    try {
      await onPayment(customerPhone, customerName);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
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
              <p className="text-muted-foreground">Your cart is empty</p>
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
                        item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"
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
                            onClick={() => onRemoveFromCart(item.menuItem.id)}
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
                            onClick={() => onAddToCart(item.menuItem)}
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
                      disabled={isProcessingPayment}
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
                      disabled={isProcessingPayment}
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full font-semibold"
                  size="lg"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${getTotalAmount()} with UPI`
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
