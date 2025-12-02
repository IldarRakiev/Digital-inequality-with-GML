import React, { useState, useEffect } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import './ClusterStatsPanel.css';

const ClusterStatsPanel = ({ ref }) => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [clustersData, setClustersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useOnScreen(ref, { threshold: 0.1 });

  const fetchClusterYearData = async (year) => {
    setLoading(true);
    try {
      const promises = [0, 1, 2].map(cluster => 
        fetch(`${import.meta.env.VITE_API_URL}/cluster-stats/${year}/${cluster}`)
          .then(res => res.ok ? res.json() : null)
      );
      const results = await Promise.all(promises);
      setClustersData(results.filter(Boolean));
    } catch (error) {
      console.error('Error fetching cluster data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchClusterYearData(selectedYear);
    }
  }, [selectedYear, isVisible]);

  const getClusterColor = (cluster) => ({
    0: '#0066cc',
    1: '#0066cc', 
    2: '#0066cc'
  }[cluster] || '#666666');

  const getClusterName = (cluster) => ({
    0: 'Low Digital Development',
    1: 'Medium Digital Development',
    2: 'High Digital Development'
  }[cluster] || `Cluster ${cluster}`);

  if (loading) {
    return (
      <section className="cluster-panel">
        <div className="cluster-loading">CLusters data receiving...</div>
      </section>
    );
  }

  return (
    <section className="cluster-panel">
      
      <div className="years-strip">
        {Array.from({ length: 15 }, (_, i) => 2014 + i).map(year => (
          <button
            key={year}
            className={`year-button ${selectedYear === year ? 'active' : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className={`cluster-grid ${isVisible ? 'visible' : ''}`}>
        {clustersData?.map((clusterData, idx) => (
          <div key={clusterData.cluster} className="cluster-card">
            <div className="cluster-header">
              <span 
                className="cluster-name" 
                style={{ color: getClusterColor(clusterData.cluster) }}
              >
                {getClusterName(clusterData.cluster)}
              </span>
              
            </div>
            
            <div className="cluster-count">
              <span className="count-number">{clusterData.countries_count}</span>
              <span className="count-label">countries</span>
            </div>

            <div className="cluster-transitions">
              <h4>Transitions</h4>
              <div className="transitions-list">
                {Object.entries(clusterData.transitions || {}).map(([key, value]) => (
                  <div key={key} className="transition-item">
                    <span className="transition-type">
                      {key === 'to_0' ? 'To cluster 0' : 
                       key === 'to_1' ? 'To cluster 1' : 
                       key === 'to_2' ? 'To cluster 2' :
                       key === 'from_0' ? 'From cluster 0' :
                       key === 'from_1' ? 'From cluster 1' :
                       key === 'from_2' ? 'From cluster 2' : key}
                    </span>
                    <span className="transition-count">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cluster-countries">
              <div className="country-section">
                <h5 style={{ color: getClusterColor(clusterData.cluster) }}>Top 5 countries</h5>
                {clusterData.top_countries?.slice(0, 5).map((country, i) => (
                  <div key={i} className="country-item">{country}</div>
                ))}
              </div>
              <div className="country-section">
                <h5 style={{ color: getClusterColor(clusterData.cluster) }}>Bottom 5 countries</h5>
                {clusterData.bottom_countries?.slice(0, 5).map((country, i) => (
                  <div key={i} className="country-item">{country}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClusterStatsPanel;
