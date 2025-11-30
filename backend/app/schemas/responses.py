from pydantic import BaseModel
from typing import List, Optional, Dict

class CountryCluster(BaseModel):
    country: str
    cluster: int
    year: int

class PredictionResponse(BaseModel):
    year: int
    total_countries: int
    clusters: List[CountryCluster]
    cluster_distribution: Dict[int, int]

class ClusterTrend(BaseModel):
    year: int
    cluster: int

class CountryTrendResponse(BaseModel):
    country: str
    trends: List[ClusterTrend]
    cluster_changes: int
    stability_score: float
    current_trend: str  # "improving", "declining", "stable" 

class ClusterIndicatorStats(BaseModel):
    indicator: str
    avg_value: float
    min_value: float  
    max_value: float
    std_dev: float

class ClusterStatsResponse(BaseModel):
    cluster: int
    name: str  # Human-readable cluster name
    color: str  # For visualization
    countries_count: int
    top_countries: List[str]  # Top countries in this cluster
    bottom_countries: List[str]  # Countries on the edge of transition
    stability: float  # Percentage of countries in cluster for 2+ years
    indicators: List[ClusterIndicatorStats]  # Stats for each indicator
    transitions: Dict[str, int]  # Transitions to/from other clusters
    regional_distribution: Dict[str, int]  # Distribution across regions    