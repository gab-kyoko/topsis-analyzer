import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// combina classes do Tailwind sem conflitos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
