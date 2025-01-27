interface ScorePillProps {
  label: string;
  score: number;
  emoji: string;
}

export function ScorePill({ label, score, emoji }: ScorePillProps) {
  const getColor = (score: number, label: string) => {
    // Invert the color scale for DEI scores
    if (label.includes('DEI')) {
      if (score >= 80) return 'bg-green-100 text-green-800';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800';
      if (score >= 40) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    // Normal color scale for other metrics
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getColor(
        score,
        label
      )}`}
    >
      <span>{emoji}</span>
      <span>
        {label}: {score}
      </span>
    </div>
  );
}
