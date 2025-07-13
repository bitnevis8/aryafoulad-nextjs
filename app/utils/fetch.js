const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const fetchWithCredentials = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Making API request to:', fullUrl);
  console.log('Request options:', { ...defaultOptions, ...options });

  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API request failed:', {
      url: fullUrl,
      status: response.status,
      error
    });
    throw new Error(error.message || 'خطا در ارتباط با سرور');
  }

  return response.json();
}; 