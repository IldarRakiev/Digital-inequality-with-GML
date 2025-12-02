// components/RegionalDonutChart.jsx
import React from 'react';

const RegionalDonutChart = ({ data, color }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  let cumulative = 0;

  const arcs = Object.entries(data).map(([key, value], i, arr) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    const sliceAngle = (value / total) * 2 * Math.PI;
    cumulative += value;

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const radius = 90;
    const centerX = 100;
    const centerY = 100;
    const x1 = centerX + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = centerY + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = centerX + radius * Math.cos(startAngle + sliceAngle - Math.PI / 2);
    const y2 = centerY + radius * Math.sin(startAngle + sliceAngle - Math.PI / 2);

    const pathData = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

    // Цвет с вариацией яркости по сектору
    const hue = (i * 360) / arr.length;
    const fill = `hsl(${hue}, 70%, 50%)`;

    return <path key={key} d={pathData} fill={fill} stroke="white" strokeWidth="2" />;
  });

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="donut-chart">
      {arcs}
      <circle cx="100" cy="100" r="50" fill="white" />
    </svg>
  );
};

export default RegionalDonutChart;
