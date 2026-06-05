import React from 'react';

/**
 * Componente para exibir preview de site
 * @param {Object} preview - Dados do preview
 * @param {string} preview.title - Título do site
 * @param {string} preview.description - Descrição
 * @param {string} preview.image - URL da imagem
 * @param {string} preview.favicon - URL do favicon
 * @param {string} preview.domain - Domínio do site
 * @param {string} preview.url - URL completa
 */
export const SitePreviewCard = ({ preview }) => {
  if (!preview) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      {/* Imagem do Preview */}
      {preview.image && (
        <div className="w-full h-40 bg-gray-200 overflow-hidden">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4">
        {/* Favicon + Domínio */}
        <div className="flex items-center gap-2 mb-2">
          {preview.favicon && (
            <img
              src={preview.favicon}
              alt="favicon"
              className="w-4 h-4"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <span className="text-xs text-gray-500 font-medium">
            {preview.domain}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
          {preview.title}
        </h3>

        {/* Descrição */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {preview.description}
        </p>

        {/* Link */}
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 break-all"
        >
          {preview.url}
        </a>
      </div>
    </div>
  );
};

export default SitePreviewCard;
