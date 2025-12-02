import { useState, useEffect } from 'react';
import './App.css';
import ClusterMap from './components/ClusterMap';
import DynamicMap from './components/DynamicMap';
import { useOnScreen } from './hooks/useOnScreen';
import AnimatedNumber from './components/AnimatedNumber';
import CountryTrendVisualization from './components/CountryTrendVisualization';
import ClusterStatsPanel from './components/ClusterStatsPanel';

function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [activeTab, setActiveTab] = useState('map');
  const [scrolled, setScrolled] = useState(false);
  const [yearsRef, isYearsVisible] = useOnScreen({
    threshold: 0.1,
    triggerOnce: true
  });
  const [keys, setKeys] = useState([]);
  const [matrix, setMatrix] = useState([]);
  //const {movies, loading, error} = useMovies();


  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`app ${scrolled ? 'scrolled' : ''}`}>
      <section id="main" className="cover">
        <div className={`cover-top ${scrolled ? 'scrolled' : ''}`}>
          <span className="cover-label">
            <span className="text-blue">Research</span> <span>project</span>
          </span>
          <nav className="header-nav">
            <a href="#main" className="nav-link">Main page</a>
            <a href="#cluster-details" className="nav-link">Cluster stats</a>
            <a href="#geography" className="nav-link">Inequality on a map</a>
            <a href="#correlations" className="nav-link">Countries trends</a>
          </nav>
          <a 
            href="https://t.me/mescudiway" 
            className="contact-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us
          </a>
        </div>

        <div className="cover-content">
          <h1 className="cover-title">
            <span className="text-blue">Digital</span> <span >Inequality</span> <span>Dashboard</span>
          </h1>

          <div className="stats-block">
            <div className="stat-item">
              <div className="stat-number">99</div>
              <div className="stat-label">countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">11 years</div>
              <div className="stat-label">of data were analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3 main</div>
              <div className="stat-label">digital level clusters</div>
            </div>
          </div>

          <div className="film-cassette">
            <img src="/photos/no_signal.png" alt="Film cassette" />
          </div>
        </div>

        <p className="cover-subtitle">
          Analyzing and mapping digital inequality using Graph Neural Networks (GNNs) approach
        </p>

        <a 
          href="https://datahub.itu.int/" 
          className="cover-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          According to <br />ITU DataHub
        </a>
      </section>

      <section id="cluster-details" className="years-section" ref={yearsRef}>
        <h2 className="section-main-title"><span className="text-blue">Digital</span> clusters over the years</h2>
        
        <div className="years-background-image" />

        <ClusterStatsPanel />
        
      </section>

      <section id="geography" className="geo-section">
        <header className="geo-header">
          <h2 className="section-title">
            <span className="text-blue">Inequality</span> on an interactive map
          </h2>
        </header>

        <main className="geography">

          <div className='geo-description'>
            <div className='left-block'>Explore the digital landscape with <span className="text-blue">an interactive map </span> 
            displaying <span className="text-blue">country clusters</span> for the selected year, revealing levels of digital development worldwide.</div>

            <div className='right-block'>Track the evolution of digital progress through a map highlighting <span className="text-blue">yearly shifts</span> in 
            country clusters—showing improvements, declines or stabilities of clusters.</div>
          </div>
          <div className="dual-map-wrapper">
            <div className="map-block">
              <ClusterMap />
            </div>
            <div className="map-block">
              <DynamicMap />
            </div>
          </div>
        </main>
      </section>

      <section id="correlations" className="corr-section">

        <div className='corr-section-title'> <span className="text-blue">Cluster</span> trends for countries</div>

        <div className="stats-background-image" />

        <div className="corr-content">
          <div className="corr-text">
            <p className="years-description" style={{ marginBottom: '100px'}}>
            Follow how each country moves between <span className="text-blue">digital development clusters</span> over time, visualized as a smooth trajectory line with key turning points.    
            Use the vertical country selector to switch perspectives and compare <span className="text-blue">stability, number of cluster changes</span>, and the <span className="text-blue">current trend</span> for any country in the dataset.
            </p>
          </div>
        </div>
        <CountryTrendVisualization />
      </section>


      <footer className="footer">
        <p>Digital Inequality Analysis • 2025 • Forecast up to 2028 year</p>
      </footer>
    </div>
  );
}

export default App;