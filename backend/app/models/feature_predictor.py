import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

class FeaturePredictor(torch.nn.Module):
    """Model for future countries features prediction"""
    def __init__(self, input_dim, hidden_dim=256, output_dim=None):
        super().__init__()
        if output_dim is None:
            output_dim = input_dim
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        self.conv3 = GCNConv(hidden_dim, hidden_dim // 2)
        self.predictor = torch.nn.Linear(hidden_dim // 2, output_dim)
        
    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.3, training=self.training)
        x = F.relu(self.conv2(x, edge_index))
        x = F.dropout(x, p=0.3, training=self.training)
        x = F.relu(self.conv3(x, edge_index))
        return self.predictor(x)