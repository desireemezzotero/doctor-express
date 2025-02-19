const express = require('express')
const router = express.Router()
//import controller
const doctorsController = require('../controllers/doctorsController')

// rotta index
router.get('/', doctorsController.index)

// Rotta show 
router.get('/:id', doctorsController.show)
module.exports = router

//store
router.post('/', movieController.store)



module.exports = router