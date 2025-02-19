const express = require('express')
const router = express.Router()

//store
router.post('/', movieController.store)
