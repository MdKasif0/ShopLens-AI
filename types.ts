// Fix: Moved GeminiAnalysisResult interface here to resolve circular dependency.
export interface GeminiAnalysisResult {
  category: string;
  itemType: string;
  colors: string[];
  patterns: string[];
  materials: string[];
  brand: string | null;
  styleKeywords: string[];
  visibleText: string[];
  description: string;
  confidence: number;
  imageUrl?: string;
}

export enum AppState {
  LANDING,
  PROCESSING,
  RESULTS,
  ERROR,
}

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  retailer: {
    name: string;
  };
  affiliateLink: string;
  similarityScore: number;
}

export interface SavedSearch {
  id: number; // Unique timestamp
  imagePreview: string;
  analysis: GeminiAnalysisResult;
}