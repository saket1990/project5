const express =require("express")
let router=express.Router()
let controller = require("../controller/user")
let productController =require("../controller/productController")
let middleware = require("../middleware/auth")
let cartController  = require("../controller/cartController")
let orderController =require("../controller/orderController")


router.post('/register', controller.createUser)
router.post('/login',controller.login)
router.get('/user/:userId/profile' , middleware.authentication,middleware.authorization_user,controller.getUser)
router.put('/user/:userId/profile' , middleware.authentication,middleware.authorization_user , controller.update)



router.post('/products', productController.createProduct);
router.get('/Products' ,productController.getProduct )
router.get('/products/:productId' ,productController.getProductById)
router.put('/products/:productId', productController.updateProduct);
router.delete('/products/:productId', productController.deleteProductById);


//cart 
router.post("/users/:userId/cart" , middleware.authentication,middleware.authorization_user,cartController.createCart)
router.put("/users/:userId/cart" , middleware.authentication,middleware.authorization_user,cartController.updateCart)
router.get("/users/:userId/cart" , middleware.authentication,middleware.authorization_user,cartController.getCart)
router.delete("/users/:userId/cart" , middleware.authentication,middleware.authorization_user,cartController.deleteCart)

//order
router.post("/users/:userId/orders" , middleware.authentication,middleware.authorization_user,orderController.createOrder)
router.put("/users/:userId/orders" , middleware.authentication,middleware.authorization_user,orderController.updateOrder)

router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available"  
    })
})

module.exports =router;