import React, { useState, useEffect } from 'react';
import YearSelector from './components/YearSelector';
import ClusterMap from './components/ClusterMap';
import { api } from './api/apiRequests';
import './App.css';

function App() {
    const [selectedYear, setSelectedYear] = useState(2023);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (year) => {
        setLoading(true);
        setError(null);
        try {
            const clustersData = await api.getClusters(year);
            setData(clustersData);
        } catch (err) {
            setError('Error when uploading the data: ' + err.message);
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedYear);
    }, [selectedYear]);

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setSelectedCluster(null);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>🌐 Digital Inequality Dashboard</h1>
                <p style={{ color: '#7f8c8d', fontSize: '18px' }}>
                    Analysis and forecasting the global digital inequality
                </p>
            </header>

            <YearSelector 
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                loading={loading}
            />

            {error && (
                <div style={{
                    padding: '15px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    border: '1px solid #ffcdd2'
                }}>
                    ❌ {error}
                </div>
            )}

            <ClusterMap 
                data={data}
                selectedCluster={selectedCluster}
                onClusterSelect={setSelectedCluster}
            />

            <footer style={{ 
                marginTop: '40px', 
                textAlign: 'center', 
                color: '#95a5a6',
                padding: '20px',
                borderTop: '1px solid #ecf0f1'
            }}>
                <p>Digital Inequality Analysis • 2025 • Forecast up to 2028 year</p>
            </footer>
        </div>
    );
}

export default App;