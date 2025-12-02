import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import world from '../../public/data/world-110m.json';
import './ClusterMap.css'; // используем те же стили

const MIN_YEAR = 2015;  // минимум для динамики
const MAX_YEAR = 2028;

const COUNTRY_MAPPING = {
  'United States': 'United States of America',
  'United Kingdom': 'United Kingdom',
  'South Korea': 'South Korea',
  'North Korea': 'North Korea',
  'Russia': 'Russia',
  'Iran': 'Iran',
  'Syria': 'Syria',
  'Czechia': 'Czech Republic',
  'Congo (Kinshasa)': 'Dem. Rep. Congo',
  'Congo (Brazzaville)': 'Congo',
  'Côte d\'Ivoire': "Côte d'Ivoire",
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Central African Republic': 'Central African Rep.',
  'Dominican Republic': 'Dominican Rep.',
  'Equatorial Guinea': 'Eq. Guinea',
  'Myanmar (Burma)': 'Myanmar',
  'Timor-Leste': 'East Timor',
  'Trinidad and Tobago': 'Trinidad and Tobago',
  'United Arab Emirates': 'United Arab Em.',
  'Venezuela': 'Venezuela (Bolivarian Republic)',
  'Viet Nam': 'Vietnam',
  'Eswatini': 'Eswatini'
};

const TREND_COLORS = {
  improved: '#0028d8ff',  // синий - улучшение
  stable: '#7b86baff',    // зеленый - стабильно
  declined: '#d74e4eff',  // красный - ухудшение
  default: '#e0e0e0'    // серый - нет данных
};

const DynamicMap = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const sliderRef = useRef();

  const [currentYear, setCurrentYear] = useState(2020);
  const [trendsData, setTrendsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (year) => {
    if (year <= MIN_YEAR) {
      setIsLoading(false);
      setError('Year must be 2015+');
      setTrendsData({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [currResponse, prevResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/predict/clusters/${year}`),
        fetch(`${import.meta.env.VITE_API_URL}/predict/clusters/${year - 1}`)
      ]);

      if (!currResponse.ok || !prevResponse.ok) {
        throw new Error(`Error when uploading data for ${year} and ${year - 1}`);
      }

      const [currData, prevData] = await Promise.all([
        currResponse.json(),
        prevResponse.json()
      ]);

      const currMap = {};
      const prevMap = {};

      currData.clusters.forEach(({ country, cluster }) => {
        const mapCountryName = COUNTRY_MAPPING[country] || country;
        currMap[mapCountryName] = cluster;
      });
      prevData.clusters.forEach(({ country, cluster }) => {
        const mapCountryName = COUNTRY_MAPPING[country] || country;
        prevMap[mapCountryName] = cluster;
      });

      const trendsMap = {};
      Object.keys(currMap).forEach(country => {
        const currCluster = currMap[country];
        const prevCluster = prevMap[country];

        if (prevCluster === undefined) {
          trendsMap[country] = 'default';
        } else if (currCluster > prevCluster) {
          trendsMap[country] = 'improved';
        } else if (currCluster < prevCluster) {
          trendsMap[country] = 'declined';
        } else {
          trendsMap[country] = 'stable';
        }
      });

      setTrendsData(trendsMap);
      updateMapColors(trendsMap);
    } catch (err) {
      setError(err.message);
      updateMapColors({});
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    svg.append('defs').html(`
      <filter id="highlight" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    `);

    svg.selectAll('*').remove();

    const mapGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'map-container');

    mapGroup.append('text')
      .attr('class', 'year-text')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text(`Cluster Dynamics — ${currentYear - 1} → ${currentYear}`);

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const worldData = topojson.feature(world, world.objects.countries);

    mapGroup.selectAll('path.country')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', '#eee')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function (event, d) {
        const countryName = d.properties.name;
        const trend = trendsData[countryName];
        if (trend !== undefined) {
          this.parentNode.appendChild(this);
          const [[x0, y0], [x1, y1]] = path.bounds(d);
          const centerX = (x0 + x1) / 2;
          const centerY = (y0 + y1) / 2;

          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${centerX},${centerY}) scale(1.05) translate(${-centerX},${-centerY})`)
            .attr('filter', 'url(#highlight)');

          d3.select(tooltipRef.current)
            .style('opacity', 1)
            .html(`
              <div class="tooltip-content">
                <h4>${countryName}</h4>
                <p>Trend: ${trend}</p>
                <p>Years: ${currentYear - 1} → ${currentYear}</p>
              </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        }
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0) scale(1)')
          .attr('filter', null);
        d3.select(tooltipRef.current).style('opacity', 0);
      });

    // Легенда
    const legendGroup = mapGroup.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 140}, ${height - 120})`);

    let i = 0;
    for (const [trend, color] of Object.entries(TREND_COLORS)) {
      if (trend === 'default') continue;

      legendGroup.append('rect')
        .attr('x', 0)
        .attr('y', i * 22)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color);

      legendGroup.append('text')
        .attr('x', 25)
        .attr('y', i * 22 + 14)
        .text(trend === 'improved' ? 'Improvement' : trend === 'stable' ? 'Stable' : 'Decline')
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');

      i++;
    }
  };

  const updateMapColors = (dataMap) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('path.country')
      .transition()
      .duration(800)
      .attr('fill', d => {
        const countryName = d.properties.name;
        return TREND_COLORS[dataMap[countryName]] || TREND_COLORS.default;
      });

    svg.select('text.year-text')
      .text(`Cluster Dynamics — ${currentYear - 1} → ${currentYear}`)
      .raise();
  };

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    fetchData(currentYear);
  }, [currentYear]);

  return (
    <div className="map-container">
      {error && <div className="error-message">{error}</div>}

      <div className="slider-container" ref={sliderRef}>
        {showGuide && (
          <div className="slider-guide" onClick={() => setShowGuide(false)}>
            Move the slider left or right to change the year
          </div>
        )}

        <div className="year-display">
          {currentYear - 1} → {currentYear}
        </div>

        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={currentYear}
          onChange={e => setCurrentYear(Number(e.target.value))}
          className="year-slider"
        />
      </div>

      {isLoading && <div className="loading">Loading data...</div>}

      <svg ref={svgRef} className="map-svg" />
      <div ref={tooltipRef} className="map-tooltip" />
    </div>
  );
};

export default DynamicMap;
