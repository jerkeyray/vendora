"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";
import { MenuItem as MenuItemType } from "../types";

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30">
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
              {quantity === 0 ? (
                <Button
                  onClick={onAdd}
                  size="sm"
                  className="w-full font-medium"
                >
                  Add
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={onRemove}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-bold text-lg min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={onAdd}
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
  );
}
