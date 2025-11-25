from pydantic import BaseModel
from typing import List, Optional

class CountryCluster(BaseModel):
    country: str
    cluster: int
    confidence: Optional[float] = None
    year: int

class PredictionResponse(BaseModel):
    year: int
    total_countries: int
    clusters: List[CountryCluster]
    cluster_distribution: Dict[int, int]