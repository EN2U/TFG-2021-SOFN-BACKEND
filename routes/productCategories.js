const express = require('express')
const productCategoriesController = require('../controller/productCategoriesController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/', productCategoriesController.initializeCategories)

module.exports = router
