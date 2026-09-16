import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Flair title shown under the level number (profile header, HUD). */
export function rankTitle(level: number): string {
  if (level >= 20) return 'Color Legend';
  if (level >= 15) return 'Color Master';
  if (level >= 10) return 'Color Explorer';
  if (level >= 5) return 'Color Painter';
  return 'Color Rookie';
}
