// src/lib/types.ts

export interface Product {
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  category?: string;
  image?: string;
  features?: string[];
  uses?: string[];
  instructions?: string[];
  gallery?: string[];
  videoUrl?: string;
  specs?: Record<string, string>;
  stock?: {
    quantity: number;
    minThreshold: number;
    unit?: string;
    location?: string;
    supplier?: string;
    price?: number;
    currency?: string;
  };
  lastUpdated?: string;
}

export interface CustomerBrainProfile {
  clientId: string;
  name: string;
  accumulated_knowledge: string;
  projects?: {
    name: string;
    location: string;
    lastProducts: string[];
  }[];
  preferences?: {
    delivery_method: string;
    preferred_hours: string;
  };
}
