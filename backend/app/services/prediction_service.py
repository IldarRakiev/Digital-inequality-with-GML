import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import torch
import pandas as pd
from typing import List, Dict, Optional
from models.feature_predictor import FeaturePredictor
from schemas.responses import CountryCluster, PredictionResponse, ClusterTrend, CountryTrendResponse, ClusterIndicatorStats, ClusterStatsResponse
import numpy as np
from models.gcn_model import GCN


class PredictionService:
    def __init__(self):
        self.gcn_model = None
        self.feature_predictor = None
        self.data = None
        self.future_data = None
        self.pivot_df = None
        self.countries = None
        self.load_models()
    
    def load_models(self):
        """Load trained models"""
        try:
            # Load GCN model
            print("🔄 Loading GCN model...")
            self.gcn_model = GCN(in_channels=123, hidden_channels=64, out_channels=3)
            #self.gcn_model = torch.load("data/simple_gcn_model.pth", map_location='cpu', weights_only=False)
            self.gcn_model.load_state_dict(torch.load(
                "data/simple_gcn_model_dict.pth", map_location="cpu"
            ))
            self.gcn_model.eval()
            print("✅ GCN model loaded!")
            
            # Load FeaturePredictor
            self.feature_predictor = FeaturePredictor(input_dim=123)
            
            # Load the graphs
            self.data = torch.load("data/digital_inequality_graph_with_years.pt", weights_only=False)
            self.future_data = torch.load("data/future_predictions_graph.pt", weights_only=False)
            self.countries = self.future_data.countries[:99]

            # Load the dataset and create a pivot_df
            df = pd.read_csv("data/cleaned_final_dataset.csv")
            self.pivot_df = df.pivot_table(
                index=["Economy", "Year"],
                columns="Indicator",
                values="Value"
            ).reset_index()
            
            print("Models and data was updated succesfully!")
            
        except Exception as e:
            print(f"Error when uploading the models: {e}")
    
    def predict_clusters(self, year: int) -> PredictionResponse:
        """Main method: predicts the clusters for the agrument year"""
        if year < 2025:
            clusters_list = self._get_historical_clusters(year)
        else:
            clusters_list = self._get_future_clusters(year)

        cluster_distribution = {}
        for item in clusters_list:
            cluster_distribution[item.cluster] = cluster_distribution.get(item.cluster, 0) + 1  

        return PredictionResponse(
            year=year,
            total_countries=len(clusters_list),
            clusters=clusters_list,
            cluster_distribution=cluster_distribution
        )       
    
    def _get_historical_clusters(self, year: int) -> List[CountryCluster]:
        """Get clusters for historical data"""
        # Filter nodes by year
        year_mask = self._get_year_mask(year)
        if year_mask.sum() == 0:
            return []

        # Use GCN model for predictions
        with torch.no_grad():
            embeddings = self.gcn_model(self.data.x, self.data.edge_index)
            clusters = embeddings.argmax(dim=1)[year_mask].cpu().numpy()
        
        return self._format_results(clusters, year, "historical")
    
    def _get_future_clusters(self, year: int) -> List[CountryCluster]:
        """Get feature clusters"""
        # Filter nodes years by year
        year_mask = self.future_data.years == year
        if year_mask.sum() == 0:
            return []

        # Use GCN model for predictions
        with torch.no_grad():
            embeddings = self.gcn_model(self.future_data.x, self.future_data.edge_index)
            clusters = embeddings.argmax(dim=1)[year_mask].cpu().numpy()
        
        return self._format_results(clusters, year, "future")
    
    def _get_year_mask(self, year: int):
        """Create mask for current year nodes"""
        start_idx, end_idx = self.data.node_offset[year]
        year_mask = torch.zeros(self.data.x.shape[0], dtype=torch.bool)
        year_mask[start_idx:end_idx] = True

        return year_mask
    
    def _format_results(self, clusters, year: int, data_type: str = "historical") -> List[CountryCluster]:
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
            year_countries = self.pivot_df[self.pivot_df['Year'] == year]['Economy'].values
            for i in range(len(clusters)):
                results.append(
                    CountryCluster(
                        country=year_countries[i],
                        cluster=int(clusters[i]),
                        year=year
                    )
                )
        
        elif data_type == "future":
            # use self.countries
            for i in range(len(self.countries)):
                results.append(
                    CountryCluster(
                        country=self.countries[i],
                        cluster=int(clusters[i]),
                        year=year
                    )
                )      

        return results
    

    # --- Trends in clusters --- #

    def get_country_trends(self, country: str, years_back: int = 5) -> Optional[CountryTrendResponse]:
        """Get the cluster's trends for current coutry"""
        print(f"🔍 Analyzing trends for {country} for the {years_back} years")
        
        trends = []
        current_year = 2025
        cluster_history = []
        
        for year in range(current_year - years_back, current_year + 1):
            clusters_data = self.predict_clusters(year)
            if clusters_data:
                country_cluster = self._find_country_in_clusters(clusters_data.clusters, country)
                if country_cluster:
                    trends.append(ClusterTrend(
                        year=year,
                        cluster=country_cluster.cluster
                    ))
                    cluster_history.append(country_cluster.cluster)
        
        if not trends:
            print(f"❌ There is no data for {country}")
            return None
        
        cluster_changes = self._calculate_cluster_changes(cluster_history)
        stability_score = self._calculate_stability_score(cluster_history)
        current_trend = self._determine_current_trend(cluster_history)
        
        return CountryTrendResponse(
            country=country,
            trends=trends,
            cluster_changes=cluster_changes,
            stability_score=stability_score,
            current_trend=current_trend
        )
    
    def _find_country_in_clusters(self, clusters: List[CountryCluster], country: str) -> Optional[CountryCluster]:
        """Found country in the list of clusters"""
        for cluster in clusters:
            if cluster.country.lower() == country.lower():
                return cluster
        return None
    
    def _calculate_cluster_changes(self, cluster_history: List[int]) -> int:
        """Calculate number of cluster changes"""
        changes = 0
        for i in range(1, len(cluster_history)):
            if cluster_history[i] != cluster_history[i-1]:
                changes += 1
        return changes
    
    def _calculate_stability_score(self, cluster_history: List[int]) -> float:
        """Calculate stability score (0-1)"""
        if len(cluster_history) <= 1:
            return 1.0
        
        changes = self._calculate_cluster_changes(cluster_history)
        max_possible_changes = len(cluster_history) - 1
        return 1.0 - (changes / max_possible_changes)
    
    def _determine_current_trend(self, cluster_history: List[int]) -> str:
        """Determine current trend"""
        if len(cluster_history) < 2:
            return "stable"
        
        # simple logic - higher value of cluster - improvement
        current = cluster_history[-1]
        previous = cluster_history[0]
        
        if current > previous:
            return "improving"
        elif current < previous:
            return "declining"
        else:
            return "stable"
        
    
    # --- Cluster stats --- #

    def get_cluster_stats(self, year: int, cluster: int) -> Optional[ClusterStatsResponse]:
        """Get detailed statistics for a specific cluster"""
        print(f"Analyzing cluster {cluster} for year {year}")
        
        # Get current year data
        current_data = self.predict_clusters(year)
        if not current_data:
            return None
        
        # Get countries in target cluster
        cluster_countries = [c for c in current_data.clusters if c.cluster == cluster]
        if not cluster_countries:
            print(f"❌ No countries in cluster {cluster} for year {year}")
            return None
        
        # Collect statistics
        cluster_name = self._get_cluster_name(cluster)
        cluster_color = self._get_cluster_color(cluster)
        
        return ClusterStatsResponse(
            cluster=cluster,
            name=cluster_name,
            color=cluster_color,
            countries_count=len(cluster_countries),
            top_countries=self._get_top_countries(cluster_countries),
            bottom_countries=self._get_bottom_countries(cluster_countries),
            stability=self._calculate_cluster_stability(cluster, year),
            indicators=self._get_cluster_indicators(cluster_countries, year),
            transitions=self._get_cluster_transitions(cluster, year),
            regional_distribution=self._get_regional_distribution(cluster_countries)
        )
    
    def _get_cluster_name(self, cluster: int) -> str:
        """Get human-readable cluster name"""
        names = {
            0: "Low Digital Development",
            1: "Medium Digital Development", 
            2: "High Digital Development",
        }
        return names.get(cluster, f"Cluster {cluster}")
    
    def _get_cluster_color(self, cluster: int) -> str:
        """Get color for visualization"""
        colors = {
            0: "#F76C5E",  # red - low development
            1: "#A8D5BA",  # green - medium development
            2: "#2E86AB",  # blue - high development 
        }
        return colors.get(cluster, "#666666")
    
    def _get_top_countries(self, cluster_countries: List[CountryCluster]) -> List[str]:
        """Get top 5 countries in cluster (placeholder)"""
        # TODO: Sort by development metrics later
        return [c.country for c in cluster_countries[:5]]
    
    def _get_bottom_countries(self, cluster_countries: List[CountryCluster]) -> List[str]:
        """Get countries on the edge of transition (last 5)"""
        return [c.country for c in cluster_countries[-5:]]
    
    def _calculate_cluster_stability(self, cluster: int, year: int) -> float:
        """Calculate cluster stability (% of countries in cluster for 2+ years)"""
        if year < 2015:  # Not enough historical data
            return 0.7
        
        # Get previous year data
        previous_data = self.predict_clusters(year - 1)
        if not previous_data:
            return 0.5
        
        # Count countries that remained in the cluster
        current_countries = {c.country for c in previous_data.clusters if c.cluster == cluster}
        previous_countries = {c.country for c in previous_data.clusters if c.cluster == cluster}
        
        stable_countries = current_countries.intersection(previous_countries)
        
        if len(current_countries) == 0:
            return 0.0
        
        return len(stable_countries) / len(current_countries)
    
    def _get_cluster_indicators(self, cluster_countries: List[CountryCluster], year: int) -> List[ClusterIndicatorStats]:
        """Get real statistics from graph features using actual feature names"""
        
        # Get feature mapping
        feature_mapping = self._get_feature_mapping()
        
        # Get node indices for countries in this cluster
        cluster_node_indices = []
        for country_cluster in cluster_countries:
            node_id = self._get_node_id_for_country_year(country_cluster.country, year)
            if node_id is not None:
                cluster_node_indices.append(node_id)
        
        if not cluster_node_indices:
            return []
        
        # Extract features for these nodes (only original features, exclude masks)
        cluster_features = self.data.x[cluster_node_indices]
        n_original_features = len(feature_mapping)
        
        # Calculate statistics only for original features (not masks)
        stats = []
        for feature_idx, feature_name in feature_mapping.items():
            if feature_idx >= n_original_features:
                continue  # Skip if beyond original features
                
            feature_values = cluster_features[:, feature_idx].cpu().numpy()
            
            # Skip if all values are the same or mostly zeros
            if np.std(feature_values) < 0.001:
                continue
                
            stats.append(ClusterIndicatorStats(
                indicator=feature_name,
                avg_value=float(np.mean(feature_values)),
                min_value=float(np.min(feature_values)),
                max_value=float(np.max(feature_values)),
                std_dev=float(np.std(feature_values))
            ))
        
        # Return top 10 most informative features (highest variance)
        stats.sort(key=lambda x: x.std_dev, reverse=True)
        return stats[:10]
    
    def _get_node_id_for_country_year(self, country: str, year: int) -> Optional[int]:
        """Find node ID for specific country and year"""
        try:
            # For historical data - use pivot_df mapping
            country_data = self.pivot_df[
                (self.pivot_df['Economy'] == country) & 
                (self.pivot_df['Year'] == year)
            ]
            if not country_data.empty:
                return country_data['node_id'].iloc[0]
            
            # For future data - check future_data
            if hasattr(self, 'future_data') and hasattr(self.future_data, 'countries'):
                for i, (c, y) in enumerate(zip(self.future_data.countries, self.future_data.years)):
                    if c == country and y == year:
                        return i
                        
        except Exception as e:
            print(f"Error finding node for {country} {year}: {e}")
        
        return None
    
    def _get_feature_names(self) -> List[str]:
        """Extract actual feature names from pivot_df structure"""

        exclude_columns = ['Economy', 'Year', 'node_id', 'digital_backwards_index']
        
        feature_columns = [col for col in self.pivot_df.columns if col not in exclude_columns]
        
        original_features = []
        for col in feature_columns:
            if not col.startswith('mask_') and col != 'digital_backwards_index':
                original_features.append(col)
        
        print(f"🔍 Found {len(original_features)} original features")
        return original_features

    def _get_feature_mapping(self) -> Dict[int, str]:
        """Create mapping from feature index to feature name"""
        feature_names = self._get_feature_names()
        
        n_original = len(feature_names)
        
        feature_mapping = {}
        for i, feature_name in enumerate(feature_names):
            feature_mapping[i] = feature_name
        
        print(f"Feature mapping created: {n_original} features")
        return feature_mapping
    
    def _get_cluster_transitions(self, cluster: int, year: int) -> Dict[str, int]:
        """Get transitions between clusters"""
        if year < 2015:
            return {}
        
        # Analyze transitions from previous year
        transitions = {}
        current_data = self.predict_clusters(year)
        previous_data = self.predict_clusters(year - 1)
        
        if not current_data or not previous_data:
            return {}
        
        # Create country to cluster mapping
        previous_clusters = {c.country: c.cluster for c in previous_data.clusters}
        
        for country_cluster in current_data.clusters:
            if country_cluster.country in previous_clusters:
                prev_cluster = previous_clusters[country_cluster.country]
                if prev_cluster != country_cluster.cluster:
                    # Transition from prev_cluster to current_cluster
                    if country_cluster.cluster == cluster:
                        key = f"from_{prev_cluster}"
                        transitions[key] = transitions.get(key, 0) + 1
                    elif prev_cluster == cluster:
                        key = f"to_{country_cluster.cluster}"
                        transitions[key] = transitions.get(key, 0) + 1
        
        return transitions
    
    def _get_regional_distribution(self, cluster_countries: List[CountryCluster]) -> Dict[str, int]:
        """Get regional distribution of countries in cluster"""
        # Simple regional mapping
        regions = {
            "Europe": ["Germany", "France", "UK", "Italy", "Spain"],
            "Asia": ["China", "Japan", "India", "South Korea"],
            "Americas": ["USA", "Canada", "Brazil", "Mexico"],
            "Other": []  # Other countries
        }
        
        distribution = {}
        for region, countries in regions.items():
            count = sum(1 for cc in cluster_countries if cc.country in countries)
            if count > 0:
                distribution[region] = count
        
        # Add remaining countries to "Other"
        other_count = len(cluster_countries) - sum(distribution.values())
        if other_count > 0:
            distribution["Other"] = other_count
        
        return distribution