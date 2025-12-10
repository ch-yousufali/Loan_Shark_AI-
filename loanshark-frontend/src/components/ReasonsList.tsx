interface ReasonsListProps {
  reasons: string[];
}

export const ReasonsList = ({ reasons }: ReasonsListProps) => (
  <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
    <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">⚠️</span> Why is this risky?
    </h2>
    <ol className="space-y-3">
      {reasons.map((reason, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="text-red-400 font-bold flex-shrink-0">{idx + 1}.</span>
          <span className="text-gray-300">{reason}</span>
        </li>
      ))}
    </ol>
  </div>
);