/**
 * EcoLoop Backend API Service
 * 
 * Centralized API client connecting the React frontend to the FastAPI backend.
 */

export const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Generic request helper with robust error handling and network failure detection
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    console.error(`Network error connecting to ${url}:`, err);
    throw new Error('Unable to connect to EcoLoop API. Please make sure the backend server is running.');
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* =========================================================
   1. FACTORY APIS
   ========================================================= */

/**
 * Fetch all registered factories
 * GET /api/factories
 */
export async function getFactories() {
  return request('/api/factories');
}

/**
 * Fetch a single factory by ID
 * GET /api/factories/{id}
 */
export async function getFactory(id) {
  return request(`/api/factories/${id}`);
}

/**
 * Register a new factory
 * POST /api/factories
 * Body: { name, location, industry_type }
 */
export async function createFactory(factoryData) {
  return request('/api/factories', {
    method: 'POST',
    body: JSON.stringify(factoryData),
  });
}

/* =========================================================
   2. FACTORY DATA APIS
   ========================================================= */

/**
 * Submit operational factory data for a factory
 * POST /api/factories/{factory_id}/data
 */
export async function createFactoryData(factoryId, data) {
  return request(`/api/factories/${factoryId}/data`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Retrieve a specific factory data submission by its ID
 * GET /api/factory-data/{id}
 */
export async function getFactoryData(id) {
  return request(`/api/factory-data/${id}`);
}

/**
 * Retrieve all operational data submissions for a factory
 * GET /api/factories/{factory_id}/data
 */
export async function getFactoryDataList(factoryId) {
  return request(`/api/factories/${factoryId}/data`);
}

/* =========================================================
   3. EMISSION CALCULATION APIS
   ========================================================= */

/**
 * Trigger backend greenhouse gas emission calculation for a factory data submission
 * POST /api/factory-data/{factory_data_id}/calculate-emissions
 */
export async function calculateEmissions(factoryDataId) {
  return request(`/api/factory-data/${factoryDataId}/calculate-emissions`, {
    method: 'POST',
  });
}

/**
 * Retrieve a single saved emission result by ID
 * GET /api/emission-results/{id}
 */
export async function getEmissionResult(id) {
  return request(`/api/emission-results/${id}`);
}

/**
 * Retrieve all emission calculations for a factory data submission
 * GET /api/factory-data/{factory_data_id}/emission-results
 */
export async function getEmissionResults(factoryDataId) {
  return request(`/api/factory-data/${factoryDataId}/emission-results`);
}

/* =========================================================
   4. RECOMMENDATION APIS
   ========================================================= */

/**
 * Retrieve all saved recommendations for a specific factory from MySQL
 * GET /api/factories/{factory_id}/recommendations
 */
export async function getFactoryRecommendations(factoryId) {
  return request(`/api/factories/${factoryId}/recommendations`);
}

/**
 * Retrieve a specific recommendation by ID
 * GET /api/recommendations/{recommendation_id}
 */
export async function getRecommendationById(recommendationId) {
  return request(`/api/recommendations/${recommendationId}`);
}

/**
 * Save a recommendation to MySQL
 * POST /api/recommendations
 */
export async function createRecommendation(recommendationData) {
  return request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(recommendationData),
  });
}

/**
 * Generate an AI or rule-based recommendation
 * POST /api/ai/recommendation
 */
export async function getAIRecommendation(aiRequestData) {
  return request('/api/ai/recommendation', {
    method: 'POST',
    body: JSON.stringify(aiRequestData),
  });
}
