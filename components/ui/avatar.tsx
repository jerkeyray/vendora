"use client";

import * as React from "react";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  email?: string | null;
  size?: number;
  className?: string;
};

// Simple MD5-like hash for demo purposes (for production, use crypto-js or similar)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export function Avatar({ src, alt, fallback, email, size = 36, className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const dimension = `${size}px`;
  const letter = (fallback || "").trim().charAt(0).toUpperCase();
  
  // Use session image (from Google/social providers) as primary source
  // Fall back to Gravatar only if no session image
  const gravatarSrc = email && !src
    ? `https://www.gravatar.com/avatar/${simpleHash(email.toLowerCase().trim())}?d=404&s=${size}`
    : undefined;
  
  const computedSrc = src || gravatarSrc;
  const shouldShowImage = computedSrc && !imageError;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-purple-600/15 text-purple-600 border border-purple-600/20 overflow-hidden ${className ?? ""}`}
      style={{ width: dimension, height: dimension }}
      aria-label={alt}
    >
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={computedSrc}
          alt={alt || "avatar"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs font-medium">{letter || "U"}</span>
      )}
    </div>
  );
}


