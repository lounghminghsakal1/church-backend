import multer from "multer";
import path from "path";

const createFileUploader = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folderName}`);
    },
    filename: (req, file, cb) => {
      const uniqueFileName = Date.now() + " - " + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueFileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if(!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
    }
    cb(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  })
};

export default createFileUploader;


