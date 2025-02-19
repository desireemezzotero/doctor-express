const express = require('express')
const router = express.Router()
//import controller
const doctorsController = require('../controllers/doctorsController')

// Rotta show 
router.get('/:id', doctorsController.show)
module.exports = router
