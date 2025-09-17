import type { Chat } from "@google/genai";

export interface AnalysisPoint {
  description: string;
  source: string;
}

export interface AnalysisResult {
  pros: AnalysisPoint[];
  cons: AnalysisPoint[];
}

export interface IdentificationResult {
  isContract: boolean;
  contractType: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isPermissionRequest?: boolean;
  sources?: GroundingSource[];
}