import type { HighlightCategory } from '../types/api';
import { getCategoryColor, getCategoryIcon } from '../utils/colorScale';

interface HighlightItemProps {
  text: string;
  category: HighlightCategory;
}

export const HighlightItem = ({ text, category }: HighlightItemProps) => (
  <div className={`border-l-4 p-4 rounded mb-3 ${getCategoryColor(category)}`}>
    <p className="text-xs font-bold mb-1">{getCategoryIcon(category)} {category}</p>
    <p className="font-mono text-sm">"{text}"</p>
  </div>
);