"use client";

import { useState } from "react";
import { Store, Menu, CartItem, PaymentInfo, MenuItem } from "../types";
import { StoreHeader } from "./StoreHeader";
import { MenuCategory } from "./MenuCategory";
import { CartSidebar } from "./CartSidebar";
import { PaymentModal } from "./PaymentModal";
import { MobileCartButton } from "./MobileCartButton";

interface MenuClientProps {
  store: Store;
  menu: Menu;
}

export function MenuClient({ store, menu }: MenuClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

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

  const getTotalAmount = () => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const handlePayment = async (customerPhone: string, customerName: string) => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        storeId: store.id,
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
        store.name || "Store"
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
        storeName: store.name || "Store",
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
      throw err; // Re-throw to handle in CartSidebar
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileCartButton cart={cart} />

      <div className="container mx-auto px-4 py-6">
        <StoreHeader store={store} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {menu.categories.map((category) => (
              <MenuCategory
                key={category.id}
                category={category}
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <CartSidebar
              cart={cart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onPayment={handlePayment}
            />
          </div>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        paymentInfo={paymentInfo}
      />
    </div>
  );
}
