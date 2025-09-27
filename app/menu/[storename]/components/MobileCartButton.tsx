"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "../types";

interface MobileCartButtonProps {
  cart: CartItem[];
}

export function MobileCartButton({ cart }: MobileCartButtonProps) {
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleScrollToCart = () => {
    document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" });
  };

  if (cart.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 lg:hidden">
      <Button
        onClick={handleScrollToCart}
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
  );
}
