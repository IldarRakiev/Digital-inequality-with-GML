from prediction_service import PredictionService
import torch
from models.gcn_model import GCN

gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
predictionService = PredictionService()
predictionService.load_models(gcn_model=gcn_model)

#from models.gcn_model import GCN
#gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
#gcn_model = torch.load("data/simple_gcn_model.pth", map_location='cpu', weights_only=False)
#gcn_model.eval()