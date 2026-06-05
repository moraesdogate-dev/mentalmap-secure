/**
 * Site Preview Utility
 * Fetches metadata and preview information from URLs
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch site metadata and preview information
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object>} Site metadata including title, description, image
 */
async function getSitePreview(url) {
  try {
    // Validate URL
    if (!isValidUrl(url)) {
      return {
        success: false,
        error: 'URL inválida'
      };
    }

    // Fetch the page
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Extract metadata
    const title = $('meta[property="og:title"]').attr('content') ||
                  $('title').text() ||
                  'Sem título';

    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       'Sem descrição';

    const image = $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content') ||
                  null;

    const favicon = $('link[rel="icon"]').attr('href') ||
                    $('link[rel="shortcut icon"]').attr('href') ||
                    getFaviconUrl(url);

    return {
      success: true,
      data: {
        url,
        title: title.substring(0, 200),
        description: description.substring(0, 500),
        image,
        favicon,
        domain: new URL(url).hostname
      }
    };
  } catch (error) {
    console.error('Error fetching site preview:', error.message);
    return {
      success: false,
      error: 'Erro ao buscar preview do site'
    };
  }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return /^https?:\/\/.+/.test(url);
  } catch {
    return false;
  }
}

/**
 * Get favicon URL from domain
 * @param {string} url - Site URL
 * @returns {string} Favicon URL
 */
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

module.exports = {
  getSitePreview,
  isValidUrl,
  getFaviconUrl
};
