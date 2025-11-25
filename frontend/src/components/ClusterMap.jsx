import React from 'react';

const ClusterMap = ({ data, selectedCluster, onClusterSelect }) => {
    if (!data) return <div style={{ padding: '20px', textAlign: 'center' }}>Select the year to analyze</div>;
    
    const clusterColors = {
        0: '#ff6b6b',
        1: '#feca57',
        2: '#45b7d1'
    };
    
    const clusterNames = {
        0: '🔴 High digital inequality',
        1: '🟡 Fast-growing',
        2: '🔵 High digital development'
    };

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>🗺️ Countries distribution by clusters: ({data.year})</h2>
            
            {/* Legend of lusters */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {Object.entries(data.cluster_distribution).map(([cluster, count]) => (
                    <div
                        key={cluster}
                        onClick={() => onClusterSelect(parseInt(cluster))}
                        style={{
                            padding: '10px 15px',
                            background: clusterColors[cluster] || '#999',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: selectedCluster === parseInt(cluster) ? '3px solid #333' : 'none',
                            fontWeight: 'bold',
                            minWidth: '120px',
                            textAlign: 'center'
                        }}
                    >
                        <div>{clusterNames[cluster] || `Кластер ${cluster}`}</div>
                        <div style={{ fontSize: '18px', marginTop: '5px' }}>{count} countries</div>
                    </div>
                ))}
            </div>
            
            {/* Data vis */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                <h3>📊 Statistics:</h3>
                <p>Countries: <strong>{data.total_countries}</strong></p>
                <p>Year: <strong>{data.year}</strong></p>
                {data.year > 2023 && <p style={{ color: '#e67e22' }}>⚠️ The data is a forecast, be vigilant!</p>}
            </div>
        </div>
    );
};

export default ClusterMap;