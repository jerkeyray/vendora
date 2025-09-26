"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  GripVertical,
  FolderPlus,
  Leaf,
  Clock,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// Toast notification function
const showToast = (message: string, type: "success" | "error" = "success") => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

interface MenuSection {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  isVeg: boolean;
  isAvailable: boolean;
}

interface MenuData {
  sections: MenuSection[];
}

const STORAGE_KEY = "vendora_menu_builder_data";

export default function MenuBuilderPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [menuData, setMenuData] = useState<MenuData>({
    sections: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);

  // Load data from localStorage
  const loadFromCache = useCallback(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          setMenuData(parsedData);
        } catch (error) {
          console.error("Error parsing cached menu data:", error);
        }
      }
    }
  }, []);

  // Save data to localStorage
  const saveToCache = useCallback((data: MenuData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const loadMenuItems = useCallback(async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/menu/get?email=${encodeURIComponent(session.user.email)}`
      );
      const data = await response.json();

      if (data.success && data.menuItems && data.menuItems.length > 0) {
        // Convert flat menu items to sections structure
        const mainSection: MenuSection = {
          id: "main",
          name: "Main Menu",
          description: "",
          items: data.menuItems.map(
            (item: {
              id: string;
              name: string;
              description?: string;
              price: number;
              isVeg: boolean;
              isAvailable: boolean;
            }) => ({
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: item.price.toString(),
              isVeg: item.isVeg,
              isAvailable: item.isAvailable,
            })
          ),
        };

        const newMenuData = { sections: [mainSection] };
        setMenuData(newMenuData);
        saveToCache(newMenuData);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, saveToCache]);

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
          router.push("/onboarding");
        } else {
          // Load from cache first, then load from server
          loadFromCache();
          loadMenuItems();
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        router.push("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, router, loadFromCache, loadMenuItems]);

  const updateMenuData = (newData: MenuData) => {
    setMenuData(newData);
    saveToCache(newData);
  };

  const addSection = () => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      name: "",
      description: "",
      items: [],
    };
    const newData = {
      ...menuData,
      sections: [...menuData.sections, newSection],
    };
    updateMenuData(newData);
  };

  const updateSection = (
    sectionIndex: number,
    field: keyof MenuSection,
    value: string
  ) => {
    const newSections = [...menuData.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      [field]: value,
    };
    updateMenuData({ ...menuData, sections: newSections });
  };

  const removeSection = (sectionIndex: number) => {
    const newSections = menuData.sections.filter((_, i) => i !== sectionIndex);
    updateMenuData({ ...menuData, sections: newSections });
  };

  const addMenuItem = (sectionIndex: number) => {
    const newItem: MenuItem = {
      name: "",
      description: "",
      price: "",
      isVeg: true,
      isAvailable: true,
    };

    const newSections = [...menuData.sections];
    newSections[sectionIndex].items.push(newItem);
    updateMenuData({ ...menuData, sections: newSections });
  };

  const removeMenuItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...menuData.sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    updateMenuData({ ...menuData, sections: newSections });
  };

  const updateMenuItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof MenuItem,
    value: string | boolean
  ) => {
    const newSections = [...menuData.sections];
    newSections[sectionIndex].items[itemIndex] = {
      ...newSections[sectionIndex].items[itemIndex],
      [field]: value,
    };
    updateMenuData({ ...menuData, sections: newSections });
  };

  const validateMenuData = () => {
    return menuData.sections.some((section) =>
      section.items.some(
        (item) =>
          item.name.trim() &&
          item.price.trim() &&
          !isNaN(parseFloat(item.price)) &&
          parseFloat(item.price) > 0
      )
    );
  };

  const handleDragStart = (sectionIndex: number, itemIndex: number) => {
    setDraggedItem({ sectionIndex, itemIndex });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    sectionIndex: number,
    itemIndex: number
  ) => {
    e.preventDefault();
    setDragOverItem({ sectionIndex, itemIndex });
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetSectionIndex: number,
    targetItemIndex: number
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newSections = [...menuData.sections];
    const draggedItemData =
      newSections[draggedItem.sectionIndex].items[draggedItem.itemIndex];

    // Remove from original position
    newSections[draggedItem.sectionIndex].items.splice(
      draggedItem.itemIndex,
      1
    );

    // Insert at new position
    newSections[targetSectionIndex].items.splice(
      targetItemIndex,
      0,
      draggedItemData
    );

    updateMenuData({ ...menuData, sections: newSections });
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const saveMenu = async () => {
    if (!session?.user?.email || !validateMenuData()) {
      showToast(
        "Please add at least one section with valid menu items.",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      // Flatten all items from all sections for API
      const allItems = menuData.sections.flatMap((section) =>
        section.items.map((item) => ({
          ...item,
          price: parseFloat(item.price),
          categoryName: section.name, // Add section name as category
        }))
      );

      const response = await fetch("/api/menu/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          menuItems: allItems,
        }),
      });

      if (response.ok) {
        clearCache();
        showToast("Menu saved successfully!");
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to save menu", "error");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getTotalItems = () => {
    return menuData.sections.reduce(
      (total, section) => total + section.items.length,
      0
    );
  };

  if (isPending || isLoading) {
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
    <main className="min-h-screen bg-background">
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="mb-6"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Menu Builder</h1>
                  <p className="text-muted-foreground">
                    Create and organize your food menu
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={addSection} variant="outline" className="px-6">
                  <FolderPlus className="mr-2 w-4 h-4" />
                  Add Section
                </Button>
                <Button
                  onClick={saveMenu}
                  disabled={
                    isSaving || getTotalItems() === 0 || !validateMenuData()
                  }
                  className="px-8"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save Menu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          {menuData.sections.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No menu sections yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start building your menu by creating your first section
              </p>
              <Button onClick={addSection} size="lg" className="px-8">
                <FolderPlus className="mr-2 w-4 h-4" />
                Create First Section
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {menuData.sections.map((section, sectionIndex) => (
                <Card key={section.id} className="p-6">
                  {/* Section Header */}
                  <div className="mb-6 pb-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">
                        Section {sectionIndex + 1}
                      </h2>
                      <Button
                        onClick={() => removeSection(sectionIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="max-w-md">
                      <div className="space-y-2">
                        <Label>Section Name</Label>
                        <Input
                          value={section.name}
                          onChange={(e) =>
                            updateSection(sectionIndex, "name", e.target.value)
                          }
                          placeholder="e.g., Appetizers, Main Course, Desserts"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-4">
                    {section.items.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-muted-foreground mb-4">
                          No items in this section
                        </p>
                        <Button
                          onClick={() => addMenuItem(sectionIndex)}
                          variant="outline"
                        >
                          <Plus className="mr-2 w-4 h-4" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      <>
                        {section.items.map((item, itemIndex) => {
                          const isDragging =
                            draggedItem?.sectionIndex === sectionIndex &&
                            draggedItem?.itemIndex === itemIndex;
                          const isDragOver =
                            dragOverItem?.sectionIndex === sectionIndex &&
                            dragOverItem?.itemIndex === itemIndex;

                          return (
                            <Card
                              key={itemIndex}
                              className={`p-4 cursor-move transition-all ${
                                isDragging
                                  ? "opacity-50 scale-95 shadow-lg"
                                  : isDragOver
                                  ? "border-primary border-2 shadow-md bg-primary/5"
                                  : "hover:shadow-md"
                              }`}
                              draggable
                              onDragStart={() =>
                                handleDragStart(sectionIndex, itemIndex)
                              }
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) =>
                                handleDragOver(e, sectionIndex, itemIndex)
                              }
                              onDragLeave={handleDragLeave}
                              onDrop={(e) =>
                                handleDrop(e, sectionIndex, itemIndex)
                              }
                            >
                              <div className="flex items-start gap-4">
                                <div className="mt-2">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div className="flex-1 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      Item {itemIndex + 1}
                                    </h4>
                                    <Button
                                      onClick={() =>
                                        removeMenuItem(sectionIndex, itemIndex)
                                      }
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Item Name *</Label>
                                      <Input
                                        value={item.name}
                                        onChange={(e) =>
                                          updateMenuItem(
                                            sectionIndex,
                                            itemIndex,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder=""
                                        className={
                                          !item.name.trim()
                                            ? "border-red-300"
                                            : ""
                                        }
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Price (₹) *</Label>
                                      <Input
                                        type="text"
                                        value={item.price}
                                        onChange={(e) =>
                                          updateMenuItem(
                                            sectionIndex,
                                            itemIndex,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                        placeholder=""
                                        className={
                                          !item.price.trim() ||
                                          isNaN(parseFloat(item.price))
                                            ? "border-red-300"
                                            : ""
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                      value={item.description}
                                      onChange={(e) =>
                                        updateMenuItem(
                                          sectionIndex,
                                          itemIndex,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      placeholder=""
                                      rows={2}
                                    />
                                  </div>

                                  <div className="flex gap-6">
                                    <div className="flex items-center space-x-3">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          id={`veg-${sectionIndex}-${itemIndex}`}
                                          checked={item.isVeg}
                                          onChange={(e) =>
                                            updateMenuItem(
                                              sectionIndex,
                                              itemIndex,
                                              "isVeg",
                                              e.target.checked
                                            )
                                          }
                                          className="sr-only"
                                        />
                                        <label
                                          htmlFor={`veg-${sectionIndex}-${itemIndex}`}
                                          className={`flex items-center justify-center w-6 h-6 rounded border-2 cursor-pointer transition-colors ${
                                            item.isVeg
                                              ? "bg-green-500 border-green-500 text-white"
                                              : "bg-red-500 border-red-500 text-white"
                                          }`}
                                        >
                                          <Leaf className="w-4 h-4" />
                                        </label>
                                      </div>
                                      <Label
                                        htmlFor={`veg-${sectionIndex}-${itemIndex}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        {item.isVeg
                                          ? "Vegetarian"
                                          : "Non-Vegetarian"}
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          id={`available-${sectionIndex}-${itemIndex}`}
                                          checked={item.isAvailable}
                                          onChange={(e) =>
                                            updateMenuItem(
                                              sectionIndex,
                                              itemIndex,
                                              "isAvailable",
                                              e.target.checked
                                            )
                                          }
                                          className="sr-only"
                                        />
                                        <label
                                          htmlFor={`available-${sectionIndex}-${itemIndex}`}
                                          className={`flex items-center justify-center w-6 h-6 rounded border-2 cursor-pointer transition-colors ${
                                            item.isAvailable
                                              ? "bg-blue-500 border-blue-500 text-white"
                                              : "border-gray-300 hover:border-blue-400"
                                          }`}
                                        >
                                          {item.isAvailable && (
                                            <Clock className="w-4 h-4" />
                                          )}
                                        </label>
                                      </div>
                                      <Label
                                        htmlFor={`available-${sectionIndex}-${itemIndex}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        Available
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}

                        <Card
                          className="p-4 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                          onClick={() => addMenuItem(sectionIndex)}
                        >
                          <div className="text-center py-6">
                            <div className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                              <Plus className="mr-2 w-4 h-4" />
                              Add Item to{" "}
                              {section.name || `Section ${sectionIndex + 1}`}
                            </div>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                </Card>
              ))}

              {/* Add Another Section Button */}
              <Card
                className="p-6 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={addSection}
              >
                <div className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <FolderPlus className="mr-2 w-5 h-5" />
                    Add Another Section
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Bottom Actions */}
          {getTotalItems() > 0 && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={saveMenu}
                disabled={isSaving || !validateMenuData()}
                size="lg"
                className="px-12 py-3 text-lg"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" />
                    Saving Menu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-5 h-5" />
                    Save Menu
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
