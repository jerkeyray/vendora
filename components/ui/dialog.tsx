"use client";

import * as React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
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
      <div className="relative z-10 w-full max-w-xl rounded-xl border bg-background p-8 text-foreground shadow-xl">
        {props.title && (
          <div className="mb-4 text-lg font-semibold">{props.title}</div>
        )}
        {props.children}
      </div>
    </div>
  );
}


