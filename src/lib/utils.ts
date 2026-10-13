import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

// Equivalent del `cn` de shadcn, que necessiten els components de snapcn.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
