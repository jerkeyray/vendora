"use client";

import { Category, CartItem, MenuItem } from "../types";
import { MenuItem as MenuItemComponent } from "./MenuItem";

interface MenuCategoryProps {
  category: Category;
  cart: CartItem[];
  onAddToCart: (menuItem: MenuItem) => void;
  onRemoveFromCart: (menuItemId: string) => void;
}

export function MenuCategory({
  category,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: MenuCategoryProps) {
  const getCartItemQuantity = (menuItemId: string) => {
    const item = cart.find((item) => item.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="mb-10">
      <div className="py-3 mb-6 border-b border-border">
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
            <MenuItemComponent
              key={item.id}
              item={item}
              quantity={getCartItemQuantity(item.id)}
              onAdd={() => onAddToCart(item)}
              onRemove={() => onRemoveFromCart(item.id)}
            />
          ))}
      </div>
    </div>
  );
}
