from prediction_service import PredictionService
import torch
from models.gcn_model import GCN

gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)

#from models.gcn_model import GCN
#gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
#gcn_model = torch.load("data/simple_gcn_model.pth", map_location='cpu', weights_only=False)
#gcn_model.eval()

future_data = torch.load("data/future_predictions_graph.pt", weights_only=False)
countries = future_data.countries[:99]
print(countries)