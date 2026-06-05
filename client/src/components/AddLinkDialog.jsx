import React, { useState } from 'react';
import { useSitePreview } from '../hooks/useSitePreview';
import SitePreviewCard from './SitePreviewCard';

/**
 * Diálogo para adicionar link com preview
 * @param {boolean} isOpen - Se o diálogo está aberto
 * @param {Function} onClose - Callback ao fechar
 * @param {Function} onAdd - Callback ao adicionar link
 * @param {string} token - Token JWT do usuário
 */
export const AddLinkDialog = ({ isOpen, onClose, onAdd, token }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const { preview, loading, error, fetchPreview, clearPreview } = useSitePreview();

  const handleFetchPreview = async () => {
    const previewData = await fetchPreview(url, token);
    if (previewData) {
      setTitle(previewData.title || title);
    }
  };

  const handleAdd = () => {
    if (!url) {
      alert('URL é obrigatória');
      return;
    }

    onAdd({
      type: 'link',
      title: title || preview?.title || 'Link',
      url,
      preview: preview || null
    });

    // Limpar formulário
    setUrl('');
    setTitle('');
    clearPreview();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Título */}
        <h2 className="text-xl font-bold mb-4">Adicionar Link</h2>

        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botão Buscar Preview */}
        <button
          onClick={handleFetchPreview}
          disabled={!url || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 mb-4 transition-colors"
        >
          {loading ? 'Buscando...' : 'Buscar Preview'}
        </button>

        {/* Erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <SitePreviewCard preview={preview} />
          </div>
        )}

        {/* Título Customizado */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={preview?.title || 'Título do link'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!url}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLinkDialog;
