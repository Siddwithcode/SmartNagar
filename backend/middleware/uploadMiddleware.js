const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { Readable } = require('stream');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const saveLocally = (file) => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);

  const port = process.env.PORT || 5000;
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
  return `${backendUrl.replace(/\/$/, '')}/uploads/${filename}`;
};

const uploadImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  if (!isCloudinaryConfigured()) {
    try {
      req.imageUrl = saveLocally(req.file);
      return next();
    } catch (error) {
      console.error('Local upload error:', error.message);
      return res.status(500).json({ message: 'Image upload failed' });
    }
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'smartnagar/issues', resource_type: 'image' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error.message);
        return res.status(500).json({ message: `Image upload failed: ${error.message}` });
      }

      req.imageUrl = result.secure_url;
      next();
    }
  );

  Readable.from(req.file.buffer).pipe(uploadStream);
};

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image file must be under 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

module.exports = { upload, uploadImage, handleUploadError };
