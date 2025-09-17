import type { Chat } from "@google/genai";

export interface AnalysisPoint {
  description: string;
  source: string;
}

export interface AnalysisResult {
  summary: string;
  evaluation: string;
  pros: AnalysisPoint[];
  cons: AnalysisPoint[];
}

export interface IdentificationResult {
  isContract: boolean;
  contractType: string;
  language: string;
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