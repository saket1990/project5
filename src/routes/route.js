const express =require("express")
let router=express.Router()
let controller = require("../controller/user")
let productController =require("../controller/productController")
let middleware = require("../middleware/auth")


router.post('/register', controller.createUser)
router.post('/login',controller.login)
router.get('/user/:userId/profile' , middleware.authentication,middleware.authorization_user,controller.getUser)
router.put('/user/:userId/profile' , middleware.authentication,middleware.authorization_user , controller.update)



router.post('/products', productController.createProduct);
router.get('/getProducts' ,productController.getProduct )
router.get('/products/:productId' ,productController.getProductById)
//router.get('/products/:productId',getProductById)
router.put('/products/:productId', productController.updateProduct);
router.delete('/products/:productId', productController.deleteProductById);



router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available"
    })
})

module.exports =router;