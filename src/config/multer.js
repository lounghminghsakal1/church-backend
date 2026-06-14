import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/family_cards");
  },
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + " - " + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueFileName);
  }
});

const fileFilters = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  if(allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only pdf or images are allowed"));
  }
}

const uploadFamilyCard = multer({
  storage: storage,
  fileFilter: fileFilters,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default uploadFamilyCard;

