const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://aryafoulad-api.parandx.com';

export const API_ENDPOINTS = {
  unitLocations: {
    base: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getAll: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/${id}`,
    create: `${API_BASE_URL}/aryafoulad/unit-locations/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/delete/${id}`,
    default: `${API_BASE_URL}/aryafoulad/unit-locations/default`,
  },
}; 