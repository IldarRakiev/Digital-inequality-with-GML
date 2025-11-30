from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import predictor, health
from schemas.responses import ClusterStatsResponse
from services.prediction_service import PredictionService

core_app = FastAPI(
    title="Digital Inequality Predictor API",
    description="Backend API for analyzing and mapping digital inequality using Graph Neural Networks (GNNs).",
    version="1.0.0"
)

core_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES REGISTRATION ---
core_app.include_router(health.router)
core_app.include_router(predictor.router)


predictionService = PredictionService()

@core_app.get("/", tags=["Root"])
def root():
    return {"message": "Digital Inequality Predictor API is running!"}

@core_app.get("/cluster-stats/{year}/{cluster}", response_model=ClusterStatsResponse)
async def get_cluster_stats(year: int, cluster: int):
    """
    Get detailed statistics for a cluster
    
    - **year**: Analysis year
    - **cluster**: Cluster number (0, 1, 2, ...)
    """
    if cluster not in [0, 1, 2]:
        raise HTTPException(status_code=400, detail="Cluster must be between 0 and 2")
    
    try:
        result = predictionService.get_cluster_stats(year, cluster)
        if result:
            return result
        else:
            raise HTTPException(status_code=404, detail=f"No data for cluster {cluster} in {year}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


app = core_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)