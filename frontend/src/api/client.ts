export const API_URL = import.meta.env.VITE_API_URL || 'https://shopsense-api-y9gt.onrender.com/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const apiClient = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            result = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || `API Error: ${response.statusText}`);
        }
        return result;
    },

    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        // Handle specific auth error
        if (response.status === 401 || response.status === 403) {
            if (!endpoint.includes('/auth/login')) {
                // handle logout logic if needed
            }
        }

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            result = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || 'API Error');
        }
        return result;
    },

    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            result = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || 'API Error');
        }
        return result;
    },

    delete: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            result = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || 'API Error');
        }
        return result;
    },
};
