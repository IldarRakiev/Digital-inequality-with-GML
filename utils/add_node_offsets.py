import torch
import pandas as pd

data = torch.load("../graphs/digital_inequality_graph.pt", weights_only=False)
df = pd.read_csv("../cleaned_final_dataset.csv")

pivot_df = df.pivot_table(
    index=["Economy", "Year"],
    columns="Indicator",
    values="Value"
).reset_index()
pivot_df["node_id"] = range(len(pivot_df))

print("📊 Info about years in graph:")
print(f"Unique years: {sorted(pivot_df['Year'].unique())}")
print(f"Nodes: {len(pivot_df)}")

if hasattr(data, 'node_offsets'):
    print(f"Delete previous node_offsets: {data.node_offsets}")
    del data.node_offsets

print(data.node_offsets)    

# Create node_offsets
def create_node_offsets(pivot_df):
    """Make node_offsets dict with years"""
    node_offsets = {}
    current_idx = 0
    
    for year in sorted(pivot_df['Year'].unique()):
        # Number of nodes for the current year
        year_count = len(pivot_df[pivot_df['Year'] == year])
        node_offsets[year] = (current_idx, current_idx + year_count)
        current_idx += year_count
        print(f"Year {year}: nodes {node_offsets[year][0]}-{node_offsets[year][1]-1}")

    print(node_offsets)    
    
    return node_offsets

def get_historical_year_mask(data, year):
    """Get the mask for historical year"""
    if hasattr(data, 'node_offset') and year in data.node_offset:
        start_idx, end_idx = data.node_offset[year]
        year_mask = torch.zeros(data.x.shape[0], dtype=torch.bool)
        year_mask[start_idx:end_idx] = True
        return year_mask
    else:
        print(f"❌ Year {year} cannot be found in node_offsets")
        print(f"Years: {list(data.node_offsets.keys()) if hasattr(data, 'node_offset') else 'No node_offsets'}")
        return torch.tensor([], dtype=torch.bool)

# Create and add node_offsets to data
data.node_offset = create_node_offsets(pivot_df)
print(f"node_offsets: {data.node_offset}")

torch.save(data, "../graphs/digital_inequality_graph_with_years.pt")
print("💾 Graph with node_offsets was saved.")

year_mask_2023 = get_historical_year_mask(data, 2023)
print(f"Nodes for 2023: {year_mask_2023.sum().item()}")