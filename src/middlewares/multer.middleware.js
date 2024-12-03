import multer from "multer"
// import "Something" from "../../public/temp"

// 31 min L11 ChaiCode Backend

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({storage: multerStorage});


