// src/services/api.js

const BASE_URL = 'https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/';

const api = {
  /**
   * Performs a GET request to the specified endpoint.
   * @param {string} endpoint - The API endpoint (e.g., "calculo?obter=dados").
   * @returns {Promise<object>} - A promise that resolves with the JSON response.
   */
  get: async (endpoint) => {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // Re-throw to allow component to handle
    }
  },
  // You can add other methods like post, put, delete here if needed
};

export default api;