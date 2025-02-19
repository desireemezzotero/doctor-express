const express = require('express');
const router = express.Router();

//Import controller
const doctorsController = require('../controllers/doctorsController');

//Rotta per restituire la lista dei dottori
router.get('/', doctorsController.indexDoctors);

//Rotta per restituire un determinato dottore con proprie recensioni
router.get('/:id', doctorsController.showDoctor);

//Rotta per aggiungere un dottore alla lista
router.post('/', doctorsController.storeDoctor);

//Rotta per modificare i dati di un determinato dottore (momentaneamente non necessaria)
router.put('/:id', doctorsController.updateDoctor);


module.exports = router