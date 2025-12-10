export type RiskLevel = 'Safe' | 'Caution' | 'High Risk' | 'Predatory';
export type HighlightCategory = 'ExcessiveCost' | 'LegalTrap' | 'DebtCycle' | 'PaymentAccess' | 'Collection';
export type Confidence = 'High' | 'Medium' | 'Low';

export interface Highlight {
  text: string;
  category: HighlightCategory;
}

export interface AnalysisResult {
  score: number;
  label: RiskLevel;
  confidence: Confidence;
  reasons: string[];
  highlights: Highlight[];
  debug: {
    rule_score: number;
    ml_score: number;
    ml_prob: number;
  };
}