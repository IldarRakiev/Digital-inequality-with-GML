# A GNN Approach to Global Digital Inequality

**ConnectLab team**  
December 2025

---

## Team

The name of the team is ConnectLab. The members are listed in the table below.

| Team Member         | Telegram       | Email Address                     |
| ------------------- | -------------- | --------------------------------- |
| Ildar Rakiev (Lead) | @mescudiway    | i.rakiev@innopolis.university     |
| Ilona Dziurava      | @a_b_r_i_c_o_s | il.dziurava@innopolis.university  |
| Anisya Kochetkova   | @anis1305      | a.kochetkova@innopolis.university |

---

## Project Topic

Our research project focuses on analyzing and mapping digital inequality using Graph Neural Networks (GNNs). Digital inequality refers to the global gap in access to the internet, digital skills, and technological resources.

Our objectives are as follows:

- Build a graph where nodes represent countries or cities (will be considered later) and edges represent similarities or connections (e.g. socioeconomic or geographical);
- Apply GNNs to predict vulnerable regions, identify clusters, and construct a "digital divide map.";
- Compare performance against classical ML models;
- Provide visualizations and an interactive tool to demonstrate insights.

Understanding where and why digital inequality emerges is crucial to closing this gap. Graph-based approaches are a natural fit: they allow us to model countries, communities, and their relations as interconnected systems, helping reveal hidden structures and clusters of inequality. The project aims to combine data science and social impact by creating a graph-based map of the global digital divide.

This project is intended for:

- Researchers and educators — who study digital inequality and seek data-driven insights;
- Policy makers and NGOs — who design initiatives to close the digital divide;
- Data scientists and ML students — who want practical examples of applying GNNs to real-world social problems.

---

## What we tried to do during the project

The project aimed to analyse global digital inequality with a graph-based approach. During the semester we followed a clear progression: build and clean a unified dataset of digital indicators, construct a meaningful graph connecting country-year records, design baseline solutions to establish reference performance, implement a GNN architecture to learn from the graph, and finally attempt a temporal-graph approach with TGAT to capture evolution over time. Below we describe these stages and the main technical choices we tried.

### Working with data

Data preparation was the first and most time-consuming stage. Instead of the initially listed datasets, we settled on a consolidated ITU-style dataset that contains Internet penetration, device and skills indicators, and related socio-economic measures. The raw file contained a wide layout with many missing values and multiple years as separate columns. We converted this to a long format (Economy, Indicator, Year, Value), cleaned non-numeric symbols, dropped duplicates, and removed obviously invalid rows.

Missing values were handled conservatively: categorical labels were encoded with label encoders where needed, and numeric indicators were imputed for modelling using a `low-development` replacement (minimum or low-percentile) where appropriate, so that `NaN`s would represent a lower level of development rather than arbitrary averages.

### Graph construction

To use GNNs, we built a graph where each node represents a country–year record. Edges were of two types: temporal edges connecting the same country across consecutive years, and similarity edges connecting country–year nodes within the same year via cosine similarity and _k_-nearest neighbours (with _k_ tuned experimentally; the report presents analysis for _k_ ∈ {5, 10, 15}, and we selected _k = 10_ as the best trade-off between connectivity and sparsity).

### Two versions of baseline solutions

We implemented two baseline pipelines to establish reference performance:

First, a purely feature-based baseline where each (Economy, Year) pair was a row in a tabular dataset. Features were standardised and reduced where useful. We trained two models here: a Random Forest classifier and a small Multi-Layer Perceptron (MLP). These models predicted cluster labels derived from unsupervised clustering (KMeans).

Second, a graph-enhanced baseline: before jumping to end-to-end GNNs, we created feature sets augmented with graph-derived representations. For this, we computed topological metrics (degree, PageRank, betweenness) and trained Node2Vec embeddings on the constructed graph. We concatenated these structural features with tabular features and retrained Random Forest and MLP models.

### GNN implementation (GCN)

Following the encouraging performance gain from graph features, we implemented a two-layer Graph Convolutional Network (GCN) using PyTorch Geometric. The GCN architecture used 123 input features, a 64-unit hidden layer with ReLU and dropout (p = 0.3), and an output layer for three cluster classes. The model was trained for 150 epochs using Adam (learning rate = 0.01, weight decay = 5 × 10^-4) on the same PyG Data object (`digital_inequality_graph.pt`).

### Experimenting with TGAT

Finally, we explored temporal modelling using a Temporal Graph Attention approach. We implemented TGAT experiments in `tgat_model.ipynb`. The temporal construction concatenated all yearly subgraphs into a global temporal edge list: intra-year similarity edges were annotated with timestamps equal to the year, and inter-year (same-country) edges connected consecutive-year nodes to capture temporal transitions.

A TGAT-style model was built using `TransformerConv` layers from PyTorch Geometric and a small MLP to encode edge timestamps; node inputs included the original features plus temporal encodings derived from edge times.

### Extending the Model to Future Years (Autoencoder-based Forecasting)

One challenge we faced is that GCN models can only operate on nodes whose features are already known. Since we needed to predict digital inequality clusters for future years (2026+), we introduced a graph autoencoder to synthesise feature vectors for future country-year nodes.

Our approach uses the static graph built from historical data and trains an autoencoder to learn a compact latent representation of node features. We created a separate forecasting class, `DigitalInequalityForecaster`, which performs graph-based forecasting by generating synthetic nodes and edges and reconstructing plausible feature values using the trained autoencoder. These synthetic features are then passed to the GCN model to obtain cluster predictions for future years.

This method allows us to extend traditional GCNs to a temporal forecasting setting and analyse digital inequality progression even when future indicators are not yet available.

---

## Main Results

### Data artifacts and visualisations

The cleaned dataset (`cleaned_final_dataset.csv`) is committed to the repository. Useful visual artefacts generated during exploration include several exploratory plots to track indicator coverage through time and to visualise inequality snapshots. Representative images from this stage include the temporal trends by indicator group:

![Temporal Trends by Indicator Group](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/Temporal_Trends_by_Indicator_Group.png)

And a final cleaned dataset preview:

![Ready dataset](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/final_1.png)

---

### Graph construction

The resulting PyTorch Geometric graph used in all GNN experiments has 734 nodes and 14,680 edges (saved in `digital_inequality_graph.pt`). We inspected the degree distribution to ensure the graph was well-connected and did not contain isolated islands after the chosen _k_.

![Degree Distribution](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/degree_distribution.png)

---

### Baseline (feature-only) results

Using only tabular features, two baseline classifiers were trained to predict cluster membership (`baseline.ipynb`).

Model performance:

| Model         | Accuracy | F1 (macro) | Key Observations                                                                             |
| ------------- | -------- | ---------- | -------------------------------------------------------------------------------------------- |
| Random Forest | 0.71     | 0.52       | Performs best on the majority class but struggles with minority clusters.                    |
| MLP           | 0.71     | 0.60       | Captures more complex relationships and shows slightly better generalization across classes. |

Confusion matrices:

![Confusion Matrices of baseline solution](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/cm1.png)

As we can observe from Figure 4, the confusion matrices revealed that both models classify the dominant cluster well, but often misclassify smaller or emerging groups of economies. This suggests underlying structural relationships that are not fully captured by traditional feature-based models motivating the transition to graph-based approaches.

UMAP visualisations:

![UMAP projection of PCA embeddings](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_pca.png)

![UMAP Random Forest](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_rf1.png) ![UMAP MLP](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_mlp1.png)

While PCA and clustering revealed meaningful group structures, the models struggled to generalize transitions between clusters over time. This indicates that contextual dependencies such as geographic proximity, trade partnerships, or shared development trajectories likely play a significant role in shaping digital inequality patterns.

---

### Graph-enhanced baseline results

Appending Node2Vec embeddings and structural metrics improved performance (`baseline_graph.ipynb`):

| Model         | Accuracy | F1 (macro) | Key Observations                                                              |
| ------------- | -------- | ---------- | ----------------------------------------------------------------------------- |
| Random Forest | 0.86     | 0.74       | High precision for dominant classes but lower recall for minority class.      |
| MLP           | 0.90     | 0.85       | Balanced performance across clusters but slightly less stable on major class. |

Confusion matrices:

![Confusion Matrices of baseline solution with graph](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/cm2.png)

UMAP projections:

![UMAP Random Forest graph](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_rf_2.png) ![UMAP MLP graph](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_mlp_2.png)

Both models achieved strong performance (85–90% accuracy), confirming that graph-based features substantially improved predictive power compared to baselines. The inclusion of structural embeddings allowed the MLP to better capture subtle relationships and transitions, particularly for underrepresented clusters.

---

### GCN (graph neural network) results

Two-layer GCN trained on full PyG Data object (`gcn_model.ipynb`):

- **Train Accuracy:** 0.98
- **Test Accuracy:** 0.94

| Model         | Accuracy | F1 (macro) | Key Observations                                                       |
| ------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| Random Forest | 0.86     | 0.74       | Relies on engineered graph metrics (PageRank, Betweenness).            |
| MLP           | 0.90     | 0.85       | Captures non-linear dependencies but ignores explicit graph structure. |
| Simple GCN    | 0.94     | 0.93       | Learns representations directly from connectivity and node features.   |

Class-wise performance metrics for the GCN demonstrate consistently high precision and recall across all categories:

| Class                | Precision | Recall | F1-score | Support |
| -------------------- | --------- | ------ | -------- | ------- |
| 0                    | 0.845     | 0.925  | 0.883    | 53      |
| 1                    | 0.992     | 0.929  | 0.959    | 126     |
| 2                    | 0.932     | 0.971  | 0.951    | 70      |
| **Overall Accuracy** |           |        | 0.940    | 249     |

The confusion matrix shows that misclassifications are rare, with most predictions aligned correctly with the true labels:

![Confusion Matrix of GCN solution](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/cm3.png)

These results confirm that the GCN effectively integrates structural and feature-based information, outperforming classical ML approaches.

To better interpret the learned representations, we applied UMAP to the 64-dimensional GCN embeddings and projected them into two dimensions. This visualization reveals clear clusters corresponding to distinct digital development levels.

UMAP projection of embeddings:

![UMAP projection of GCN embeddings](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/umap_1.png)

The graph-based approach demonstrated that incorporating relational information between countries significantly enhances model performance. Unlike classical models that rely on static feature vectors or engineered graph metrics, the GCN learns representations directly from the structure of global digital relationships.

---

### TGAT (temporal) results

TGAT training was performed for 50 epochs. The notebook logs the training/test progression: test accuracy fluctuated in the range 0.66–0.70 during training, with the final checkpoint showing test accuracy near 0.64. The TGAT training log printed in the notebook shows test accuracy during training and the final reported values (selected epoch outputs):

| Epoch | Loss   | Test Acc |
|-------|--------|----------|
| 05    | 1.0057 | 0.6717   |
| 10    | 1.0249 | 0.6621   |
| 15    | 1.0401 | 0.6662   |
| 20    | 1.0007 | 0.6703   |
| 25    | 0.9934 | 0.6689   |
| 30    | 0.9578 | 0.6689   |
| 35    | 0.9586 | 0.7003   |
| 40    | 0.9843 | 0.7003   |
| 45    | 0.9609 | 0.7016   |
| 50    | 0.9427 | 0.6444   |

We concluded that TGAT in the current implementation was unstable and did not outperform the GCN. The decision was to retain TGAT as an experimental branch and continue with the GCN-based pipeline for the main analysis and visualisation.

---

### Autoencoder-based Forecasting

The developed forecasting pipeline successfully learned temporal feature dynamics across countries and demonstrated stable performance during historical validation, achieving low MSE and MAE when comparing predicted and real 2023 indicators. After training on the full 2014–2023 dataset, the model generated feature projections for 2025, which were then embedded into a similarity-based graph for clustering. The pretrained GCN reliably separated countries into distinct inequality groups, producing consistent cluster assignments with high confidence scores. The resulting clusters reflect meaningful structural differences in future digital development patterns and offer an interpretable segmentation of expected digital inequality levels in 2025.

![2025 forecast](https://raw.githubusercontent.com/IldarRakiev/Digital-inequality-with-GML/main/images/forecast.png)

---

### Web Interface and Deployment

As a final component of the project, we designed a lightweight web interface that visualises the model outputs and provides an intuitive way to explore digital inequality across time. The interface is centred around an interactive world map that displays the predicted clusters for each country. Users can select any available year and immediately observe how digital development levels evolve over time. The three clusters correspond to low, medium, and high digital development, allowing for a clear and interpretable comparison across regions.

In addition to viewing a single year, the interface also includes a dedicated map illustrating five-year cluster dynamics. For each country, the map highlights whether its digital development level has increased, remained stable, or decreased over the last five years. This offers a concise way to evaluate recent trends in digital progression and understand how individual countries diverge from or converge towards global development patterns. Visualising short-term movement alongside long-term forecasting provides a more complete perspective on the trajectory of global digital inequality.

The full system is containerised. The backend, which exposes the prediction and data-processing API, is packaged using Docker. We provide both a Dockerfile and a docker-compose.yml to simplify setup. When launched with Docker Compose, the backend service runs on localhost:8000.

---

### Summary interpretation

The main takeaway from the project is that structural information is crucial: graph-derived features substantially improved baseline results, and a straightforward GCN trained end-to-end produced the strongest accuracy on the assigned clustering task. Temporal modelling with TGAT was implemented and explored but did not yield a superior model on this dataset given the current temporal granularity and the way timestamps were encoded. Future work could focus on richer temporal signals, more refined temporal edge construction, and regularisation strategies for TGAT.

---

## Limitations and Future Work

While the project successfully demonstrated the value of graph-based modelling for digital inequality, there are several limitations to note. First, the dataset used, although consolidated and cleaned, still contains missing values and uneven coverage across countries and years. Our imputation strategies allowed modelling to proceed, but they may introduce bias by over- or underestimating development indicators in certain regions. Additionally, the current dataset aggregates national-level statistics, which may mask intra-country disparities that are critical for fine-grained inequality analysis.

Second, the graph construction relies on similarity metrics and $k$-nearest neighbours that are heuristically chosen. While k = 10 provided a reasonable balance, the choice of similarity function, edge weighting, and temporal connectivity is not guaranteed to capture all meaningful relationships. This affects both baseline graph features and the GCN, and may limit generalization to new or unseen countries or time periods.

Third, the temporal modelling via TGAT was implemented experimentally but exhibited unstable training and lower test performance compared to the static GCN. Temporal edge construction was relatively simple (connecting consecutive years per country), and more sophisticated encoding of time, seasonality, or cross-country temporal interactions could be necessary to fully leverage temporal graph attention mechanisms.

Finally, the models focus on cluster prediction based on unsupervised labels and do not directly incorporate causal or socio-economic interventions. Interpretability is partially achieved via embeddings and UMAP visualisations, but understanding the drivers of digital inequality requires further domain-specific analysis beyond predictive accuracy.

Future directions:

- Enhancing the dataset with additional indicators and subnational data to better capture local digital inequalities.
- Experimenting with alternative graph construction strategies, including weighted edges, multi-relational graphs, and dynamic edge formation, to improve relational representations.
- Improving TGAT and other temporal GNN models with richer temporal encodings, edge attention mechanisms, and regularization to stabilize training and potentially outperform static GCNs.
- Integrating interpretability methods such as feature importance on graph embeddings or attention visualization to uncover drivers of inequality.
- Extending the analysis to predict future trends or simulate the impact of policy interventions, providing actionable insights for policymakers and NGOs.

---

## Reading

The following articles provide background and further insights relevant to our project. They cover graph neural networks, temporal graph modeling, node embeddings, and digital inequality analysis. Brief descriptions explain their relevance to our approach.

- [Kipf and Welling (2017)](https://arxiv.org/pdf/1609.02907) introduce Graph Convolutional Networks (GCNs) for semi-supervised classification. Their work forms the foundation for our use of GCNs to predict clusters in digital inequality networks.
- [Veličković et al. (2018)](https://arxiv.org/pdf/1710.10903) propose Graph Attention Networks (GATs), which use attention mechanisms to weigh neighboring nodes. This helps understand potential extensions for weighting edges in our similarity graph.
- [Xu et al. (2019)](https://arxiv.org/pdf/1810.00826) analyze the expressive power of GNNs and provide guidance on choosing architectures for capturing graph structures. This is relevant when designing our GCN layers.
- [Xu et al. (2020)](https://arxiv.org/pdf/2002.07962) explore inductive learning on temporal graphs (TGAT), directly informing our experiments with temporal graph modeling for year-to-year digital inequality.
- [Hilbert (2016)](https://www.sciencedirect.com/science/article/abs/pii/S0308596116000276) discusses patterns of global digital inequality, highlighting economic and geographic factors. This provides context for our dataset construction and feature selection.
- [Grover and Leskovec (2016)](https://arxiv.org/pdf/1607.00653) describe Node2Vec embeddings for capturing node similarity in graphs, which we use in our graph-enhanced baseline models to improve cluster prediction.

---

## Work Distribution

- **Anisya Kochetkova:** Data Collection, Cleaning, and Exploration, Feature Importance Analysis;
- **Ildar Rakiev:** Graph Construction, GCN Workflow, Experiments with TGAT, Visualization of the results;
- **Ilona Dziurava:** Proposal and Reports Writing, Baseline Modeling, Graph-enhanced baseline.
