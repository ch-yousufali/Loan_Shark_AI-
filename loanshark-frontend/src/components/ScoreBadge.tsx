import type { RiskLevel } from '../types/api';
import { getColorByLabel } from '../utils/colorScale';

interface ScoreBadgeProps {
  score: number;
  label: RiskLevel;
  confidence: string;
}

export const ScoreBadge = ({ score, label, confidence }: ScoreBadgeProps) => {
  const iconMap: Record<RiskLevel, string> = {
    'Safe': '✅',
    'Caution': '⚠️',
    'High Risk': '🔶',
    'Predatory': '🚨',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Risk Score</p>
          <p className="text-5xl font-bold text-white">{score}</p>
          <p className="text-gray-500 text-xs mt-1">out of 100</p>
        </div>
        <div className="text-right">
          <div className={`${getColorByLabel(label)} px-4 py-2 rounded-lg font-bold text-white mb-3`}>
            {iconMap[label]} {label}
          </div>
          <p className="text-xs text-gray-400">Confidence: <span className="text-gray-200">{confidence}</span></p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all ${score <= 20 ? 'bg-green-500' :
              score <= 50 ? 'bg-amber-500' :
                score <= 80 ? 'bg-orange-500' : 'bg-red-500'
            }`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};