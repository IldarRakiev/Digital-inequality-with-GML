import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {

    healthCheck: async () => {
        const response = await axios.get(`${API_BASE}/health`);
        return response.data;
    },

    getClusters: async (year) => {
        const response = await axios.get(`${API_BASE}/predict/${year}`);
        return response.data;
    },

    getTrends: async (country, yearsBack = 5) => {
        const response = await axios.get(
            `${API_BASE}/predict/trends/${country}?years_back=${yearsBack}`
        );
        return response.data;
    },

    getClustersStats: async (year, cluster) => {
        const response = await axios.get(`${API_BASE}/cluster-stats/${year}/${cluster}`);
        return response.data;    
    }
};