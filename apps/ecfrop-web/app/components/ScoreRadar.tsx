import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { Analysis } from '../types/analysis';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ScoreRadarProps {
  analysis: Analysis;
  compact?: boolean;
}

export function ScoreRadar({ analysis, compact = false }: ScoreRadarProps) {
  const data = {
    labels: [
      'Complexity',
      'Business Cost',
      'Market Impact',
      'Administrative Cost',
      'DEI',
      'Automation',
    ],
    datasets: [
      {
        label: 'Scores',
        data: [
          analysis.complexityScore,
          analysis.businessCostScore,
          analysis.marketImpactScore,
          analysis.administrativeCostScore,
          analysis.deiScore,
          analysis.automationPotential,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: compact ? 1 : 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          display: !compact,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !compact,
      },
    },
    elements: {
      line: {
        tension: 0.2,
      },
      point: {
        radius: compact ? 0 : 3,
        hoverRadius: compact ? 0 : 4,
      },
    },
    maintainAspectRatio: true,
  };

  return (
    <div className={compact ? 'w-full h-full' : 'w-full max-w-md mx-auto'}>
      <Radar data={data} options={options} />
    </div>
  );
}
