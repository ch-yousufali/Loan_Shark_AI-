const defaultHost = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : 'http://localhost:8000';

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  defaultHost.replace(/\/$/, '');

export interface AnalysisResponse {
  score: number;
  label: 'Safe' | 'Caution' | 'High Risk' | 'Predatory';
  confidence: 'High' | 'Medium' | 'Low';
  reasons: string[];
  highlights: Array<{
    text: string;
    category: 'ExcessiveCost' | 'LegalTrap' | 'DebtCycle' | 'PaymentAccess' | 'Collection';
  }>;
  debug: {
    rule_score: number;
    ml_score: number;
    ml_prob: number;
  };
}

export const analyzeText = async (text: string): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
};

export const analyzeFile = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/analyze/file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
};

// Backwards compatibility alias
export const analyzeContract = analyzeText;

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
};