"use client";

import * as React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

type DialogHeaderProps = {
  children: React.ReactNode;
};

type DialogTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function Dialog(props: DialogProps) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => props.onOpenChange(false)}
      />
      {props.children}
    </div>
  );
}

export function DialogContent({
  className = "",
  children,
}: DialogContentProps) {
  return (
    <div
      className={`relative z-10 w-full max-w-xl rounded-xl border bg-background p-6 text-foreground shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className = "", children }: DialogTitleProps) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}
