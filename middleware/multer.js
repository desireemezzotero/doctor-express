const multer = require('multer');

// upload dellimmagine
const storage = multer.diskStorage({
  destination: "./public/img",
  filename: (req, file, cb) => {
    // creo un nome univoco per il file
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
})

const upload = multer({ storage });

module.exports = upload