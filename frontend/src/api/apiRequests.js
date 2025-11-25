import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {

    getClusters: async (year) => {
        const response = await axios.get(`${API_BASE}/predict/${year}`);
        return response.data;
    },
    
    getDistribution: async (year) => {
        const response = await axios.get(`${API_BASE}/clusters/distribution/${year}`);
        return response.data;
    },
    
    getCountriesByCluster: async (year, cluster) => {
        const response = await axios.get(`${API_BASE}/countries/${year}?cluster=${cluster}`);
        return response.data;
    },
    
    healthCheck: async () => {
        const response = await axios.get(`${API_BASE}/health`);
        return response.data;
    }
};