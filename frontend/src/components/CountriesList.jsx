import React from 'react';

const CountriesList = ({ topCountries = [], bottomCountries = [], color }) => {
  return (
    <div className="countries-list">
      <div className="country-group">
        <h4 style={{ color }}>Top 5 countries</h4>
        {topCountries.length === 0 && <p>No data</p>}
        {topCountries.map((country, i) => (
          <div key={i} className="country-item">{country}</div>
        ))}
      </div>
      <div className="country-group">
        <h4 style={{ color }}>Bottom 5 countries</h4>
        {bottomCountries.length === 0 && <p>No data</p>}
        {bottomCountries.map((country, i) => (
          <div key={i} className="country-item">{country}</div>
        ))}
      </div>
    </div>
  );
};

export default CountriesList;
