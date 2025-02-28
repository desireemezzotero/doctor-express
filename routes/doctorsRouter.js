const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');

//Import controller
const doctorsController = require('../controllers/doctorsController');



//Rotta per restituire la lista dei dottori
router.get('/', doctorsController.indexDoctors);

//Rotta per restituire un determinato dottore con proprie recensioni
router.get('/:id', doctorsController.showDoctor);

//Rotta per aggiungere un dottore alla lista
router.post('/', upload.single('image'), doctorsController.storeDoctor);

//Rotta per aggiungere una recensione alla lista
router.post('/:id/reviews', doctorsController.storeReview);

//Rotta per modificare i dati di un determinato dottore (momentaneamente non necessaria)
router.put('/:id', doctorsController.updateDoctor);

router.get('/speciality/:id', doctorsController.specialitiesSelect)


module.exports = router