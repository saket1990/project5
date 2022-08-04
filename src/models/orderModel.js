const { default: mongoose } = require("mongoose")

let ObjectId = mongoose.Types.ObjectId


const orderSchema = new mongoose.Schema(
    
 { 
    userId: {type:ObjectId, ref:'user'},
  items: [{
    productId: {type:ObjectId, ref:'Product', require:true},
    quantity: {type:Number, require:true, min:1}
  }],
  totalPrice: {type:Number, require:true},
  totalItems: {type:Number, require:true},
  totalQuantity: {type:Number, require:true},
  cancellable: {type:Boolean, default: true},
  status: {type:String, default: 'pending', enum:["pending", "completed", "cancelled"]},
  deletedAt: {type:Date}, 
  isDeleted: { type:Boolean,default:false},
  
},{timestamps:true}

)
module.exports = mongoose.model('Order', orderSchema)   