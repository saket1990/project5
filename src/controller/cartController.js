const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const vfy = require('../utility/validation')
/*---------------------- create cart ----------------------*/

const createCart = async (req, res) => {
    try {
        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (vfy.isEmptyObject(data)) return unsuccess(res, 400, 'Post Body is empty, Please add some key-value pairs')

        // destructure data here
        let { productId, quantity, cartId } = data
        // if quantity does't exist then add 1 default
        if (quantity < 1 ) return unsuccess(res, 400, ' Quantity value is >= 1 !')
        if (typeof quantity != 'number') return unsuccess(res, 400, ' Quantity must be a number!')
        quantity = quantity || 1;
        // basic validations
        // validate products 
        if (vfy.isEmptyVar(productId)) return unsuccess(res, 400, ' ProductId must be required!')
        if (!vfy.isValidObjectId(productId)) return unsuccess(res, 400, ' Invalid ProductId!')
        // validate quantity
        // if (vfy.isEmptyVar(quantity)) return unsuccess(res, 400, ' Quantity must be required!')

        // is a valid id 
        if (!vfy.isValidObjectId(userId)) return unsuccess(res, 400, ' Invalid userId !')

        // check broduct exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return unsuccess(res, 404, ' productId not found!')

        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (cart) {
            // validate cartID
            if (vfy.isEmptyVar(cartId)) return unsuccess(res, 400, ' CartId must be required!')
            if (!vfy.isValidObjectId(cartId)) return unsuccess(res, 400, ' Invalid cartId !')
            // check both cartid's from req.body and db cart are match or not?
            if (cart._id != cartId) return unsuccess(res, 400, ' CartId does\'t belong to this user!')



            // we neeed to check if the item already exist in my item's list or NOT!!

            //we are going to check two conditions that product exists and new product is added

            //if product already exists and user adding the same product existed in his/her cart
            let flag = 0;
            if (productId && quantity) {
                for (let i = 0; i < cart.items.length; i++) {
                    if (cart.items[i].productId == productId) {
                        cart.items[i].quantity += quantity
                        flag = 1;
                        break;
                    }
                }//product exists if flag==1
            
            if (flag !=1) {
                 cart.items.push({ productId, quantity })
                console.log(cart.items)
                // let index = cart.items.indexOf(addItem.productId)
                // console.log(index)
               // cart.items[index].quantity = req.body.quantity
            }
        }
            // now going to calculate total price

            let totalPrice = cart.totalPrice + (quantity * product.price)

            cart.totalPrice = Math.round(totalPrice * 100) / 100;

            let totalQuantity = cart.items.length
            console.log(totalQuantity)
            cart.totalItems = totalQuantity;



   
            // console.log(cart)
            // let index = -1;
            // for (let i = 0; i < cart.items.length; i++) {
            //     if (cart.items[i].productId == productId) {
            //         index = i
            //         break
            //     }
            // }

            // now we need to add item
            // if (index >= 0) {
            //     cart.items[index].quantity = cart.items[index].quantity + quantity
            // } else {
            //     cart.items.push({ productId, quantity })
            // }

            // update price
            // let total = cart.totalPrice + (product.price * quantity)
            // cart.totalPrice = Math.round(total * 100) / 100
            // // update quantity
            // cart.totalItems = cart.items.length
            // update cart
            await cart.save()
            return res.status(201).send({ status: true, Message: "Item added successfully and Cart updated!", cart })
        }

        // round OFF total
        let totalPrice = product.price * quantity
        total = Math.round(totalPrice * 100) / 100

        // need to create new cart here 
        const object = {
            userId,
            items: [{ productId, quantity }],
            totalPrice: total,
            totalItems: 1
        }

        const createCart = await cartModel.create(object)
        console.log(createCart)
        return res.status(201).send({ status: true, Message: ' Item added successfully and New cart created!', createCart })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, Message: error.message })

    }

}



const updateCart = async (req, res) => {
    try {
        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (vfy.isEmptyObject(data)) return unsuccess(res, 400, ' Post Body is empty, Please add some key-value pairs')

        // destructure data here
        let { productId, cartId, removeProduct } = data

        // basic validations
        // validate products
        if (vfy.isEmptyVar(productId)) return unsuccess(res, 400, ' ProductId must be required!')
        if (!vfy.isValidObjectId(productId)) return unsuccess(res, 400, ' Invalid ProductId!')
        // validate quantity
        if (isNaN(removeProduct)) return unsuccess(res, 400, ' removeProduct must be required!')
        if (typeof removeProduct != 'number') return unsuccess(res, 400, ' removeProduct must be a number!')
        //  if you want, like removeProduct = 2 then remove quantity by 2 for that comment  line
        if (removeProduct < 0 || removeProduct > 1) return unsuccess(res, 400, ' removeProduct value is only 0 and 1 !')

        // is a valid id 
        if (!vfy.isValidObjectId(userId)) return unsuccess(res, 400, ' Invalid userId !')

        // check broduct exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return unsuccess(res, 404, ' productId not found!')
        // validate cartID
        if (vfy.isEmptyVar(cartId)) return unsuccess(res, 400, ' CartId must be required!')
        if (!vfy.isValidObjectId(cartId)) return unsuccess(res, 400, ' Invalid cartId !')
       
        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (!cart) return unsuccess(res, 404, ' Cart not found!')
        // check both cartid's from req.body and db cart are match or not?
        if (cart._id != cartId) return unsuccess(res, 400, ' CartId does\'t belong to this user!')
        
        // we neeed to check if the item already exist in my item's list or NOT!!

        let flag = -1;

        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {

                flag = i;
                break;
            }
            else {
                return res.status(400).send({status :false , Message:"this product'id is not available ...pls try another"})
            }
        }
        if (!cart.items[flag]) { return res.status(400).send({ status: false, Message: "item is not present or already deleted" }) }

        if (flag >= 0) {
            if (cart.items[flag].quantity < removeProduct) return res.status(400).send({ status: false, Message: ` Can't remove, please provide removeProduct <= ${cart.items[flag].quantity} !` })
            //     else {
            //         return res.status(400).send({status:false , Message:"item you are trying to remove does not exist in your cart"})
            //     }
            // }
            // remove item(s) 1 or all
            if (removeProduct == 0) {
                // update price
                let total = cart.totalPrice - (product.price * cart.items[flag].quantity)
                cart.totalPrice = Math.round(total * 100) / 100
                cart.items.splice(flag, 1) //remove full item
            }
             
            else {
                // update price
                let total = cart.totalPrice - (product.price * removeProduct)
                cart.totalPrice = Math.round(total * 100) / 100
                if (cart.items[flag].quantity == removeProduct) {
                    cart.items.splice(flag, 1) //remove full item
                }
                else {
                    cart.items[flag].quantity = cart.items[flag].quantity - removeProduct //update quantity
                }
            }
        }
            // update quantity
            cart.totalItems = cart.items.length
            // update cart
            await cart.save()
            return success(res, 200, cart, `You just ${removeProduct == 0 ? 'remove an item from your cart' : 'decress quantity by ' + removeProduct} !`,)

        } catch (_) {
            console.log(_)
            unsuccess(res, 500, `⚠️ Error: ${_.message}`)
        }
    }



const getCart = async function (req, res) {
        try {
            const userId = req.params.userId
            // authroization is being checked through Auth(Middleware)
            const checkCart = await cartModel.findOne({ userId: userId }) //.populate('items.productId')
            if (!checkCart) { return res.status(404).send({ status: false, Message: 'cart not found ' }) }

            res.status(200).send({ status: true, Message: 'sucess ', data: checkCart })
        } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
    }


    const deleteCart = async function (req, res) {
        try {
            const userId = req.params.userId
            // authroization is being checked through Auth(Middleware)
            const checkCart = await cartModel.findOne({ userId: userId })
            if(checkCart.items.length==0) return res.status(400).send({status:false , Message: "this cart is already deleted"})
            if (!checkCart) { return res.status(400).send({ status: false, Message: 'cart not found ' }) }
            await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })
            res.status(204).send({ status: true, Message: 'sucessfully deleted' })
        } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
    }

    //--------------------
    const success = (res, statusCode, Data, Message) => {
        return res.status(statusCode).send({ status: true, Message: Message, data: Data })
    }

    const unsuccess = (res, statusCode, Message) => {
        return res.status(statusCode).send({ status: !true, Message: Message })
    }

    module.exports = { createCart, updateCart, getCart, deleteCart }