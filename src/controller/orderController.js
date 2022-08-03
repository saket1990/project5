const orderModel = require("../models/orderModel");
const { create } = require("../models/productModel");
const userModel = require("../models/userModel");


const createOrder = async function (req,res){

let body = req.body
let userId= req.params.userId
let findUser = await userModel.findbyId(userId)
if(!findUser){return res.status(400).send({status:false , Message:"user not found "})}

let {cancellable,cartId}=body;

let findCart = await cartModel.findbyId(cartId)
 if(findCart.userId!==userId){return res.status(400).send({status:false , Message: "userId not matched with cart"})}
let showObject={}
if(cartId){
    showObject.userId =userId
    showObject.items = findCart.items;
    showObject.totalPrice= findCart.totalPrice;
   let totQuan = function(){
    let totalQuantity=0;
    for(let i=0;i<findCart.items;i++){
        totalQuantity += findCart.items.quantity
    }
    return totalQuantity;
   }
    showObject.totalQunatity=  totQuan()
    

}
showObject.cancellable = cancellable;
//showObjects ={cancellable}

let orderCreated = await orderModel.create(showObject);
return res.status(201).send({status:true ,orderCreated })

}