import React from 'react';

const ClusterTransitionsChart = ({ transitions, color }) => {
  // Преобразуем transitions словарь вида {"from0to1": 5, "to2to1": 3} в список для отображения
  const entries = Object.entries(transitions || {}).filter(([key, count]) => count > 0);

  return (
    <div className="transitions-chart">
      {entries.length === 0 && <p>There is no data bout transitions</p>}
      {entries.map(([key, count]) => {
        const parts = key.match(/from(\d+)to(\d+)/i);
        if (!parts) return null;
        const from = parts[1], to = parts[2];
        return (
          <div key={key} className="transition-item">
            <span>CLuster {from}</span>
            <span className="transition-arrow">→</span>
            <span>Cluster {to}</span>
            <span>: {count} countries</span>
          </div>
        );
      })}
    </div>
  );
};

export default ClusterTransitionsChart;
