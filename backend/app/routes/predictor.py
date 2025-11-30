from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from services.prediction_service import PredictionService
from schemas.responses import CountryCluster, PredictionResponse, ClusterTrend, CountryTrendResponse
from models.gcn_model import GCN

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"],
    responses={404: {"description": "Not allowed"}}
)

predictionService = PredictionService()

@router.get("/clusters/{year}")
async def predict_clusters(year: int):
    """
    Predicts the clusters of digital development for the current year
    
    - **year**: Year of prediction
    """
    if year < 2014 or year > 2028:
        raise HTTPException(status_code=400, detail="Year must be in range 2014-2028")
    
    try:
        results = predictionService.predict_clusters(year)
        return PredictionResponse(
            year=year,
            total_countries=results.total_countries,
            clusters=results.clusters,
            cluster_distribution=results.cluster_distribution
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when making a prediction: {str(e)}")
    

@router.get("/trends/{country}", response_model=CountryTrendResponse)
async def get_country_trends(
    country: str, 
    years_back: int = 5
):
    """
    Get clusters history for current country
    
    - **country**: Name of country
    - **years_back**: Years back for analyse (default: 5)
    """
    try:
        result = predictionService.get_country_trends(country, years_back)
        if result:
            return result
        else:
            raise HTTPException(status_code=404, detail=f"There is no trends data about {country}..")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")    