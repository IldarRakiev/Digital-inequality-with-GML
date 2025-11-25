import React from 'react';

const YearSelector = ({ selectedYear, onYearChange, loading }) => {
    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];
    
    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>📅 Select the year for analysis:</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => onYearChange(year)}
                        disabled={loading}
                        style={{
                            padding: '10px 16px',
                            border: '2px solid',
                            borderColor: selectedYear === year ? '#007acc' : '#ddd',
                            background: selectedYear === year ? '#007acc' : 'white',
                            color: selectedYear === year ? 'white' : '#333',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {year}
                        {year > 2023 && ' 🔮'}
                    </button>
                ))}
            </div>
            {loading && <p style={{ marginTop: '10px', color: '#666' }}>Data uploading...</p>}
        </div>
    );
};

export default YearSelector;