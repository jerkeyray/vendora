"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ChefHat, User, ArrowLeft, ArrowRight, Check } from "lucide-react";

interface OnboardingData {
  step: number;
  vendor: {
    name: string;
    phone: string;
    upiId: string;
  };
  store: {
    name: string;
    description: string;
    address: string;
  };
}

const STORAGE_KEY = "vendora_onboarding_data";
const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const email = session?.user?.email as string | undefined;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    step: 1,
    vendor: {
      name: "",
      phone: "",
      upiId: "",
    },
    store: {
      name: "",
      description: "",
      address: "",
    },
  });

  // Load data from localStorage
  const loadFromCache = useCallback(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          setOnboardingData(parsedData);
          setCurrentStep(parsedData.step || 1);
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      }
    }
  }, []);

  // Save data to localStorage
  const saveToCache = useCallback((data: OnboardingData) => {
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

  // Check if user is already onboarded
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch(
          `/api/onboarding?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await response.json();

        if (data.onboardingComplete) {
          clearCache();
          router.push("/dashboard");
          return;
        } else {
          setIsCheckingStatus(false);
          loadFromCache();
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsCheckingStatus(false);
        loadFromCache();
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, clearCache, loadFromCache, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Update data and save to cache
  const updateData = useCallback(
    (updates: Partial<OnboardingData>) => {
      const newData = {
        ...onboardingData,
        ...updates,
        step: currentStep,
      };
      setOnboardingData(newData);
      saveToCache(newData);
    },
    [onboardingData, currentStep, saveToCache]
  );

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateUPI = (upi: string): boolean => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upi);
  };

  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!onboardingData.vendor.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (
      onboardingData.vendor.phone.trim() &&
      !validatePhone(onboardingData.vendor.phone.trim())
    ) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!onboardingData.vendor.upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (!validateUPI(onboardingData.vendor.upiId.trim())) {
      newErrors.upiId = "Please enter a valid UPI ID (e.g., yourname@bank)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!onboardingData.store.name.trim()) {
      newErrors.storeName = "Store name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateData({ step: nextStep });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateData({ step: prevStep });
    }
  };

  const handleSubmit = async () => {
    if (!email || isSubmitting) return;

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          vendor: onboardingData.vendor,
          store: onboardingData.store,
        }),
      });

      if (response.ok) {
        clearCache();
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Something went wrong" });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || isCheckingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Store Details", icon: ChefHat },
    { number: 3, title: "Review", icon: Check },
  ];

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Vendora!</h1>
          <p className="text-muted-foreground text-lg">
            Let&apos;s set up your vendor profile and store in just a few steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Step {step.number}
                    </p>
                    <p
                      className={`text-xs ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-16 ml-6 transition-all duration-300 ${
                        currentStep > step.number ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className="p-4">
            <CardHeader className="text-center pt-6 pb-8">
              <CardTitle className="text-2xl">Personal Information</CardTitle>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={onboardingData.vendor.name}
                  onChange={(e) => {
                    updateData({
                      vendor: {
                        ...onboardingData.vendor,
                        name: e.target.value,
                      },
                    });
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                  placeholder="Your full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={onboardingData.vendor.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    updateData({
                      vendor: { ...onboardingData.vendor, phone: value },
                    });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: "" });
                    }
                  }}
                  placeholder="10 digit phone number (optional)"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID *</Label>
                <Input
                  id="upiId"
                  value={onboardingData.vendor.upiId}
                  onChange={(e) => {
                    updateData({
                      vendor: {
                        ...onboardingData.vendor,
                        upiId: e.target.value,
                      },
                    });
                    if (errors.upiId) {
                      setErrors({ ...errors, upiId: "" });
                    }
                  }}
                  placeholder="yourname@paytm"
                  className={errors.upiId ? "border-red-500" : ""}
                />
                {errors.upiId && (
                  <p className="text-sm text-red-500">{errors.upiId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be used for receiving payments from customers
                </p>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Store Information */}
        {currentStep === 2 && (
          <Card className="p-4">
            <CardHeader className="text-center pt-6 pb-8">
              <CardTitle className="text-2xl">Store Information</CardTitle>
              <p className="text-muted-foreground">Set up your store details</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={onboardingData.store.name}
                  onChange={(e) => {
                    updateData({
                      store: { ...onboardingData.store, name: e.target.value },
                    });
                    if (errors.storeName) {
                      setErrors({ ...errors, storeName: "" });
                    }
                  }}
                  placeholder="Your store name"
                  className={errors.storeName ? "border-red-500" : ""}
                />
                {errors.storeName && (
                  <p className="text-sm text-red-500">{errors.storeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={onboardingData.store.description}
                  onChange={(e) =>
                    updateData({
                      store: {
                        ...onboardingData.store,
                        description: e.target.value,
                      },
                    })
                  }
                  placeholder="Brief description of your store and what you serve"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This will help customers understand what you offer
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Textarea
                  id="address"
                  value={onboardingData.store.address}
                  onChange={(e) =>
                    updateData({
                      store: {
                        ...onboardingData.store,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="Your store location or address"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Help customers find your location
                </p>
              </div>

              <div className="flex justify-between pt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <Card className="p-4">
            <CardHeader className="text-center pt-6 pb-8">
              <CardTitle className="text-2xl">
                Review Your Information
              </CardTitle>
              <p className="text-muted-foreground">
                Please review your details before submitting
              </p>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Personal Info Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2 w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {onboardingData.vendor.name}
                    </span>
                  </div>
                  {onboardingData.vendor.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">
                        {onboardingData.vendor.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI ID:</span>
                    <span className="font-medium">
                      {onboardingData.vendor.upiId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Info Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <ChefHat className="mr-2 w-5 h-5 text-primary" />
                  Store Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Store Name:</span>
                    <span className="font-medium">
                      {onboardingData.store.name}
                    </span>
                  </div>
                  {onboardingData.store.description && (
                    <div>
                      <span className="text-muted-foreground">
                        Description:
                      </span>
                      <p className="font-medium mt-1">
                        {onboardingData.store.description}
                      </p>
                    </div>
                  )}
                  {onboardingData.store.address && (
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium mt-1">
                        {onboardingData.store.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {errors.submit && (
                <p className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg">
                  {errors.submit}
                </p>
              )}

              <div className="flex justify-between pt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
