import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSku(prefix: string = 'JKE'): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${year}-${randomPart}-${sequence}`;
}
