// Cloudinary configuration and upload utility (Backend Upload)

const API_BASE_URL = '';

/**
 * Upload image to Cloudinary via backend
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/imageupload/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url; // Returns the HTTPS URL of the uploaded image
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload base64 image to Cloudinary via backend
 * @param {string} base64String - The base64 encoded image string
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadBase64ToCloudinary = async (base64String) => {
  try {
    // Convert base64 to File object
    const blob = await fetch(base64String).then(res => res.blob());
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    
    // Use the same upload function
    return await uploadToCloudinary(file);
  } catch (error) {
    console.error('Base64 upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary via backend
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/imageupload/delete/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Image delete error:', error);
    throw error;
  }
};
