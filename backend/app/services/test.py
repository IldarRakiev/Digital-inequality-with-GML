import torch
import pandas as pd
from typing import List, Dict
import sys, os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from models.gcn_model import GCN
from models.feature_predictor import FeaturePredictor


future_data = torch.load("data/future_predictions_graph.pt", weights_only=False)

# Load the dataset and create a pivot_df
df = pd.read_csv("data/cleaned_final_dataset.csv")
pivot_df = df.pivot_table(
    index=["Economy", "Year"],
    columns="Indicator",
    values="Value"
).reset_index()

countries = future_data.countries[:99]


def format_results(clusters, future_data, year: int, data_type: str = "historical") -> List[Dict]:
        """
        Universal function for formatting clustering results
        
        Args:
            clusters: predicted clusters array
            mask: boolean mask for selected nodes
            year: target year
            data_type: "historical" or "future"
        """
        results = []
        
        if data_type == "historical":
            year_countries = pivot_df[pivot_df['Year'] == year]['Economy'].values
            for i in range(len(clusters)):
                results.append({
                    'country': year_countries[i],
                    'cluster': int(clusters[i]),
                    'year': year
                })
        
        elif data_type == "future":
            # use self.countries
            for i in range(len(set(countries))):
                results.append({
                    'country': countries[i],
                    'cluster': int(clusters[i]),
                    'year': year,
                    'data_type': 'future'
                })
        
        return results


gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
gcn_model = torch.load("data/simple_gcn_model.pth", map_location='cpu', weights_only=False)
gcn_model.eval()

data = torch.load("data/digital_inequality_graph_with_years.pt", weights_only=False)
#data = torch.load("data/future_predictions_graph.pt", weights_only=False)

#start_idx, end_idx = data.node_offset[2023]
#year_mask = torch.zeros(data.x.shape[0], dtype=torch.bool)
#year_mask[start_idx:end_idx] = True

with torch.no_grad():
    for i in range(2023, 2024):
        start_idx, end_idx = data.node_offset[i]
        year_mask = torch.zeros(data.x.shape[0], dtype=torch.bool)
        year_mask[start_idx:end_idx] = True
        #year_mask = data.years == i
        embeddings = gcn_model(data.x, data.edge_index)
        clusters = embeddings.argmax(dim=1)[year_mask].cpu().numpy()
        print(len(clusters))
        print(format_results(clusters, future_data, i, "historical"))

#print(f_data.countries)

  