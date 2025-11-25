from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predictor, health

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


@core_app.get("/", tags=["Root"])
def root():
    return {"message": "Digital Inequality Predictor API is running!"}


app = core_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)