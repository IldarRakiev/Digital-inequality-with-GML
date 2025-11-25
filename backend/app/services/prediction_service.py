import torch
import pandas as pd
from typing import List, Dict
from ..models.gcn_model import GCN
from ..models.feature_predictor import FeaturePredictor

class PredictionService:
    def __init__(self):
        self.gcn_model = None
        self.feature_predictor = None
        self.data = None
        self.future_data = None
        self.load_models()
    
    def load_models(self):
        """Load trained models"""
        try:
            # Load GCN model
            self.gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
            self.gcn_model.load_state_dict(torch.load("app/data/simple_gcn_model.pth", map_location='cpu'))
            self.gcn_model.eval()
            
            # Load FeaturePredictor
            self.feature_predictor = FeaturePredictor(input_dim=123)
            
            # Load the graphs
            self.data = torch.load("app/data/digital_inequality_graph.pt")
            self.future_data = torch.load("app/data/future_predictions_graph.pt")
            
            print("Models and data was updated succesfully!")
            
        except Exception as e:
            print(f"Error when uploading the models: {e}")
    
    def predict_clusters(self, year: int) -> List[Dict]:
        """Main method: predicts the clusters for the agrument year"""
        if year < 2024:
            return self._get_historical_clusters(year)
        else:
            return self._get_future_clusters(year)
    
    def _get_historical_clusters(self, year: int) -> List[Dict]:
        """Get clusters for historical data"""
        # Filter nodes by year
        mask = self._get_year_mask(year)
        if mask.sum() == 0:
            return []
        
        # Use GCN model for predictions
        with torch.no_grad():
            embeddings = self.gcn_model(self.data.x, self.data.edge_index)
            clusters = embeddings.argmax(dim=1)[mask].cpu().numpy()
        
        return self._format_results(clusters, mask, year)
    
    def _get_future_clusters(self, year: int) -> List[Dict]:
        """Get feature clusters"""
        # Filter nodes years by year
        mask = self.future_data.years == year
        if mask.sum() == 0:
            return []
        
        # Use GCN model for predictions
        with torch.no_grad():
            embeddings = self.gcn_model(self.future_data.x, self.future_data.edge_index)
            clusters = embeddings.argmax(dim=1)[mask].cpu().numpy()
        
        return self._format_future_results(clusters, mask, year)
    
    def _get_year_mask(self, year: int):
        """Create mask for current year nodes"""
        # Logic here
        pass
    
    def _format_results(self, clusters, mask, year: int) -> List[Dict]:
        """Format the results to JSON"""
        results = []
        # Logic here
        return results
    
    def _format_future_results(self, clusters, mask, year: int) -> List[Dict]:
        """Format the results for the future data"""
        results = []
        # Logic here
        return results