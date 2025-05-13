import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fromatPrice(
  price: number | string,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("en-US", {
    currency: options.currency ?? "USD",
    style: options.style ?? "currency",
    notation: options.notation ?? "compact",
  }).format(Number(price));
}
