"""
App package initialization.
This file makes 'app' a Python package and can contain global app-level setup if needed.
"""

from fastapi import FastAPI

# Create FastAPI instance (initialized here to allow imports from submodules)
app = FastAPI(
    title="Digital Inequality Predictor API",
    description="Backend API for analyzing and mapping digital inequality using Graph Neural Networks (GNNs).",
    version="1.0.0"
)

# Routers will be imported and included inside main.py