"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import { PaymentInfo } from "../types";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: PaymentInfo | null;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentInfo,
}: PaymentModalProps) {
  if (!paymentInfo) return null;

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const handleOpenUPI = () => {
    const upiUrl = `upi://pay?pa=${paymentInfo.upiId}&pn=${encodeURIComponent(
      paymentInfo.storeName
    )}&am=${paymentInfo.amount}&cu=INR&tn=${encodeURIComponent(
      `Order ${paymentInfo.orderNumber}`
    )}`;
    window.location.href = upiUrl;
  };

  const handleTrackOrder = () => {
    onOpenChange(false);
    window.location.href = `/order/${paymentInfo.orderNumber}`;
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentInfo.upiId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>

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
                <span className="font-mono text-sm">{paymentInfo.upiId}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyUPI}
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
            {isMobile
              ? "Your UPI app should have opened automatically. Complete the payment and return here."
              : "Please pay using any UPI app with the above details."}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleTrackOrder}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Track Order
            </Button>

            {!isMobile && (
              <Button variant="outline" onClick={handleOpenUPI}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open UPI
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
