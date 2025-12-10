import type { RiskLevel } from '../types/api';

export const getColorByScore = (score: number): string => {
  if (score <= 20) return '#10B981'; // Green - Safe
  if (score <= 50) return '#F59E0B'; // Amber - Caution
  if (score <= 80) return '#F97316'; // Orange - High Risk
  return '#EF4444'; // Red - Predatory
};

export const getColorByLabel = (label: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    'Safe': 'bg-green-500',
    'Caution': 'bg-amber-500',
    'High Risk': 'bg-orange-500',
    'Predatory': 'bg-red-500',
  };
  return colors[label];
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'ExcessiveCost': 'bg-red-500/20 border-red-500 text-red-300',
    'LegalTrap': 'bg-red-900/20 border-red-900 text-red-200',
    'DebtCycle': 'bg-orange-500/20 border-orange-500 text-orange-300',
    'PaymentAccess': 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    'Collection': 'bg-red-600/20 border-red-600 text-red-200',
  };
  return colors[category] || 'bg-gray-500/20 border-gray-500 text-gray-300';
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'ExcessiveCost': '💰',
    'LegalTrap': '⚖️',
    'DebtCycle': '🔄',
    'PaymentAccess': '💳',
    'Collection': '📞',
  };
  return icons[category] || '⚠️';
};