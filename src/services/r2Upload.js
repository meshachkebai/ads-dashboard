/**
 * R2 Upload Service for Audio Ads
 * Handles file uploads to Cloudflare R2 via Worker
 */

const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL;

/**
 * Slugify text for file paths
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Upload audio ad and optional artwork to R2
 * @param {Object} params - Upload parameters
 * @param {File} params.audioFile - Audio file to upload
 * @param {File} params.artworkFile - Optional artwork file
 * @param {string} params.brandName - Brand name
 * @param {string} params.campaignName - Campaign name
 * @param {string} params.adName - Ad name/version
 * @returns {Promise<{audioUrl: string, artworkUrl: string|null}>}
 */
export async function uploadAdToR2({
  audioFile,
  artworkFile,
  brandName,
  campaignName,
  adName
}) {
  if (!WORKER_URL) {
    throw new Error('R2 Worker URL not configured. Please set VITE_R2_WORKER_URL in .env');
  }

  // Create form data
  const formData = new FormData();
  formData.append('audioFile', audioFile);
  formData.append('uploadType', 'ad'); // Tell worker this is an ad upload
  
  if (artworkFile) {
    formData.append('artworkFile', artworkFile);
  }
  
  formData.append('brandName', brandName);
  formData.append('campaignName', campaignName);
  formData.append('adName', adName);

  // Call Cloudflare Worker
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
      }
      console.error('R2 Upload Error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage
      });
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.audioUrl) {
      throw new Error('Upload succeeded but no audio URL returned');
    }
    
    return {
      audioUrl: result.audioUrl,      // ads/brand/campaign/audio.mp3
      artworkUrl: result.artworkUrl,  // ads/brand/campaign/artwork.jpg
      audioPath: result.audioPath,
      artworkPath: result.artworkPath
    };
  } catch (error) {
    // Network errors or other fetch failures
    if (error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot reach upload server at ${WORKER_URL}`);
    }
    throw error;
  }
}

/**
 * Get audio file duration
 * @param {File} audioFile - Audio file
 * @returns {Promise<number>} Duration in seconds
 */
export async function getAudioDuration(audioFile) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.round(audio.duration));
    });
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio file'));
    });
    audio.src = URL.createObjectURL(audioFile);
  });
}
