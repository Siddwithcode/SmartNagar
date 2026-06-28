const cloudinary = require('cloudinary').v2;

const PLACEHOLDERS = [
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret',
];

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  return (
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !PLACEHOLDERS.includes(CLOUDINARY_CLOUD_NAME) &&
    !PLACEHOLDERS.includes(CLOUDINARY_API_KEY) &&
    !PLACEHOLDERS.includes(CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = { cloudinary, isCloudinaryConfigured };
