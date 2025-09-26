export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[-\s]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(baseName: string, existingSlugs: string[] = []): string {
  let slug = generateSlug(baseName);
  let counter = 1;
  const originalSlug = slug;
  
  // Check if slug already exists and append number if needed
  while (existingSlugs.includes(slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Convert slug back to readable name (for display purposes)
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
