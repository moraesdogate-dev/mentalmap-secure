import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Hook para buscar preview de sites
 * @returns {Object} { preview, loading, error, fetchPreview }
 */
export const useSitePreview = () => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreview = async (url, token) => {
    if (!url) {
      setError('URL é obrigatória');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/preview`, {
        params: { url },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPreview(response.data.data);
        return response.data.data;
      } else {
        setError(response.data.message || 'Erro ao buscar preview');
        return null;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar preview';
      setError(errorMessage);
      console.error('Preview error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return {
    preview,
    loading,
    error,
    fetchPreview,
    clearPreview
  };
};
