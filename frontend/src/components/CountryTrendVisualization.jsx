import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import './CountryTrendVisualization.css';
import AnimatedNumber from './AnimatedNumber';

const COUNTRIES = ['Albania', 'Algeria', 'Armenia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 
  'Belgium', 'Bhutan', 'Bolivia (Plurinational State of)', 'Bosnia and Herzegovina', 'Brazil', 'Brunei Darussalam', 
  'Bulgaria', 'Cabo Verde', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 
  "Côte d'Ivoire", 'Denmark', 'Dominican Rep.', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 
  'Greece', 'Hong Kong, China', 'Hungary', 'Iceland', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 
  'Japan', 'Jordan', 'Kazakhstan', 'Korea (Rep. of)', 'Kuwait', 'Latvia', 'Lesotho', 'Lithuania', 'Luxembourg', 'Macao, China', 'Malawi', 'Malaysia', 
  'Malta', 'Mauritius', 'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 'Morocco', 'Netherlands', 'North Macedonia', 'Norway', 'Oman', 'Paraguay', 'Peru', 
  'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Romania', 'Russian Federation', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Spain', 
  'State of Palestine', 'Suriname', 'Sweden', 'Switzerland', 'Taiwan, Province of China', 'Thailand', 'Türkiye', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
  'United States', 'Uruguay', 'Uzbekistan', 'Viet Nam', 'Zimbabwe'
];

const CountryTrendVisualization = () => {
  const [selectedIndex, setSelectedIndex] = useState(COUNTRIES.indexOf('United States'));
  const selectedCountry = COUNTRIES[selectedIndex];

  const [trendData, setTrendData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const svgRef = useRef();
  const scrollRef = useRef();
  const wheelRef = useRef(null);

  // следим за секцией
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.3 });

    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  // загрузка данных по стране
  useEffect(() => {
    if (selectedIndex < 0) return;

    fetch(`${import.meta.env.VITE_API_URL}/predict/trends/${encodeURIComponent(selectedCountry)}`)
      .then(res => res.json())
      .then(data => setTrendData(data))
      .catch(console.error);
  }, [selectedCountry, selectedIndex]);

  // рендер графика
  useEffect(() => {
    if (!trendData?.trends?.length || !isVisible) return;

    const data = trendData.trends.slice().sort((a, b) => a.year - b.year);

    const margin = { top: 30, right: 40, bottom: 60, left: 80 };
    const width = 930;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, 2.2])
      .range([height, 0]);

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(''))
      .call(g => g.select('.domain').remove());

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(''))
      .call(g => g.select('.domain').remove());

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.cluster))
      .curve(d3.curveMonotoneX)
      .defined(d => d.cluster !== null);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#0066cc')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    g.selectAll('.trend-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'trend-dot')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.cluster))
      .attr('r', 8)
      .attr('fill', '#0066cc')
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('d')));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(3).tickFormat(d => ['Low', 'Medium', 'High'][d]));

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('font-weight', '500')
      .style('font-size', '14px')
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -65)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('font-weight', '500')
      .style('font-size', '14px')
      .text('Digital Development Cluster');
  }, [trendData, isVisible]);

  // колесико выбора страны
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setSelectedIndex(prev => {
      const next = Math.max(0, Math.min(COUNTRIES.length - 1, prev + delta));
      return next;
    });
  }, []);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    const handler = (e) => handleWheel(e);
    el.addEventListener('wheel', handler, { passive: false });

    return () => el.removeEventListener('wheel', handler);
  }, [handleWheel]);

  const prevCountry = selectedIndex > 0 ? COUNTRIES[selectedIndex - 1] : null;
  const nextCountry = selectedIndex < COUNTRIES.length - 1 ? COUNTRIES[selectedIndex + 1] : null;

  return (
    <div className="country-trend-container" ref={scrollRef}>
      <div className="country-trend-inner">
        {/* ЛЕВАЯ ПОЛОВИНКА — слайдер стран */}
        <aside className="country-slider" ref={wheelRef}>
          <div className="slider-label">Scroll to change country</div>

          <div className="slider-window">
            <div className="slider-item slider-item-above">
              {prevCountry || '—'}
            </div>

            <div className="slider-item slider-item-current">
              {selectedCountry}
            </div>

            <div className="slider-item slider-item-below">
              {nextCountry || '—'}
            </div>

            <div className="slider-center-highlight" />
          </div>
        </aside>

        {/* ПРАВАЯ ПОЛОВИНКА — график + стата */}
        <main className="trend-right">


          <div className="trend-main">
            <svg ref={svgRef} className="trend-chart" />

            {trendData && (
              <div className="trend-stats">
                <div className="stat-item">
                  <div className="stat-number">
                    <AnimatedNumber value={trendData.cluster_changes} duration={1.2} />
                  </div>
                  <div className="stat-label">Cluster Changes</div>
                </div>

                <div className="stat-item">
                  <div className="stat-number">
                    <AnimatedNumber
                      value={trendData.stability_score}
                      decimals={2}
                      duration={1.2}
                    />
                  </div>
                  <div className="stat-label">Stability Score</div>
                </div>

                <div className="stat-item">
                  <div className={`trend-badge ${trendData.current_trend}`}>
                    {trendData.current_trend === 'improving'
                      ? 'Improving'
                      : trendData.current_trend === 'declining'
                      ? 'Declining'
                      : 'Stable'}
                  </div>
                  <div className="stat-label">Current Trend</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CountryTrendVisualization;
