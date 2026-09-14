import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function abbreviateName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return name;
  const firstName = parts[0];
  const lastNameInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastNameInitial}.`;
}
