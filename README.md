# A GNN Approach to Global Digital Inequality
A research project focused on analyzing and mapping **digital inequality** using **Graph Neural Networks (GNNs)**. The project is developed as part of the **Data and Knowledge Representation** and **Practical Machine Learning and Deep Learning** courses.


## 🚀 Introduction
Digital inequality refers to the global gap in internet access, digital skills, and technological resources.  

Our objectives are:  
- Build a graph where nodes represent countries or cities (will be considered later) and edges represent similarities or connections (e.g., socioeconomic or geographical).  
- Apply **GNNs** to predict vulnerable regions, identify clusters, and construct a "digital divide map."  
- Compare performance against classical ML models.  
- Provide visualizations and an interactive tool to demonstrate insights.

## 👥 Motivation/Target Audience

Understanding **where and why digital inequality emerges** is crucial to closing this gap. 
Graph-based approaches are a natural fit: they allow us to model countries, communities, and their relations as interconnected systems, helping reveal **hidden structures and clusters of inequality**.  
Project aims to combine data science and social impact by creating a **graph-based map of the global digital divide**.

This project is intended for:  
- **Researchers and educators** — who study digital inequality and seek data-driven insights.  
- **Policy makers and NGOs** — who design initiatives to close the digital divide.  
- **Data scientists and ML students** — who want practical examples of applying GNNs to real-world social problems.   


## 📊 Proposed Data Sources
Planned data sources include:  
- [Internet and Mobile Adoption Worldwide](https://www.opendatabay.com/data/ai-ml/c6b68ad2-832c-4efa-bd32-c9ad33f44678) — internet penetration, GDP.  
- [Global poverty and inequality dataset](https://www.kaggle.com/datasets/utkarshx27/global-poverty-and-inequality-dataset) — Kaggle dataset of Global poverty and inequality by the World Bank.  
- [UNESCO Open Data](https://data.uis.unesco.org/) — education and digital skills metrics related to Internet usage and availability.  

**Steps:** preprocessing, normalization, and integration into a unified graph dataset.

**Important note:** we reserve the right to add new datasets or exclude some of the current ones during the development process, depending on their relevance and suitability for our research goals.


## 🧠 Models
We plan to explore and benchmark:  
- **Baselines:** Random Forest, Logistic Regression.  
- **GNN models:**  
  - Graph Convolutional Network (GCN)  
  - GraphSAGE  
  - Graph Attention Network (GAT)  

The focus will be on model evaluation, hyperparameter tuning, and interpretability of results.

## ⚙️ Workflow
1. **Data collection & cleaning** (country-level indicators).  
2. **Graph construction** (example: nodes = countries, edges = similarities or geographic connections).  
3. **Baseline models** (classical ML without graph structure).  
4. **GNN experiments** (GCN, GraphSAGE, GAT).  
5. **Visualization** (clusters, digital divide maps).  
6. **Deployment** (prototype dashboard or web app).
7. **Documentation & reporting** (progress reports, final paper, presentation).

## 🛠 Proposed Tech Stack
- Python 3.10  
- PyTorch Geometric  
- Pandas, NumPy  
- NetworkX  
- Matplotlib / Plotly (for visualization)   
