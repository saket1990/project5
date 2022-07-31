const productModel = require("../models/productModel")
const vfy = require('../utility/validation')



let createProduct = async function(req,res){

    try{
    let data = JSON.parse(JSON.stringify(req.body));

    // check body is empty or not
    if(vfy.isEmptyObject(data)) return res.status(400).send({status:false, message:"Please provide required Data"}) 

    let {title, description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments  }=data;

    // check All Mandatory tag present or not , and it's contain proper value or not

    if(!vfy.isValid(title)) return res.status(400).send({status:false, message:"Title tag is Required"})
    title = vfy.removeSpaces(title) 

    if(!vfy.isValid(description )) return res.status(400).send({status:false, message:"Description tag is Required"}) 
    description=vfy.removeSpaces(description) 

    if(!vfy.isValid(price)) return res.status(400).send({status:false, message:"Price tag is Required"}) 
    if(!vfy.IsNumeric(price)) return res.status(400).send({status:false, message:"price must be a number"}) 

    if(currencyId || currencyId == ''){
        if(!vfy.isValid(currencyId)) return res.status(400).send({status:false, message:"CurrencyId tag is Required"}) 
        if(currencyId.toUpperCase()!="INR") return res.status(400).send({status:false, message:"Please provide currencyId only 'INR'"}) 
    }
   
   if(currencyFormat || currencyFormat==''){
    if(!vfy.isValid(currencyFormat)) return res.status(400).send({status:false, message:"CurrencyFormat tag is Required"}) 
    if(currencyFormat !="₹") return res.status(400).send({status:false, message:"Only Indian Currency ₹ accepted"}) 
   }
   

    if(isFreeShipping || isFreeShipping==''){
        let boolArr = ["true", "false"]
        // if(typeof isFreeShipping != 'Boolean') 
        if(!boolArr.includes(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping type must be boolean"}) 
    }

    if(style || style==''){
        if(!vfy.isValid(style)) return res.status(400).send({status:false, message:"If you are provide stype key then you have to provide some data"}) 
        style = removeSpaces(style)
    }


    if(!availableSizes) return res.status(400).send({ status: false, msg: "availableSizes should be present" })


    let allSizes = availableSizes.split(",");
    let bool = await checkAllSizes(allSizes);
    if(bool){
    availableSizes = [...allSizes]
    }



   if(!bool) return res.status(400).send({ status:false, Message: `availableSizes is accept like ["S", "XS", "M", "X", "L", "XXL", "XL"] !` })

   if(installments){
    if(!vfy.isValid(installments)) return res.status(400).send({status:false, message:"installments tag is required"}) 
    if(!vfy.IsNumeric(installments)) return res.status(400).send({status:false, message:"installments must be number"})
   }
   




   // files concept here

   let files = req.files;
   if(files.length==0) return res.status(400).send({ status: !true, message: "productImage is required" })
   if(!vfy.acceptFileType(files[0],'image/jpeg', 'image/png'))  return res.status(400).send({ status: false, message: "we accept jpg, jpeg or png as product image only" })
   let myUrl = await uploadFile(files[0]);
//    console.log(myUrl);
   productImage=myUrl;


   // db call for title
   let isTitleExist = await productModel.findOne({title:title});
   if(isTitleExist) return res.status(409).send({status:false, message:`"${title}" title already available, Please provide unique title`});
   

   // prepare object with all requirement
   let realData = {title,description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes:[...allSizes], installments,productImage}
   
   // perform db call for creating Document
   let my= await productModel.create(realData);
   res.status(201).send({status:true, data:my})


    }catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}








const getProduct = async function (req, res) {
    let { name, size, priceGreaterThan, priceLessThan, priceSort } = req.query
    let filters = { isDeleted: false }

    if (name) {
        let findTitle = await productModel.find()
        let fTitle = findTitle.map(x => x.title).filter(x => x.includes(name))

        filters.title = {$in : fTitle} // title me agar is array elements me se kuch bhi milra ho na to le aao 
    }

    if (size) {
        let size1 = size.split(",").map(x => x.trim().toUpperCase())
        if (size1.map(x => isValidSize(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be among  S,XS,M,X,L,XXL,XL" })
        filters.availableSizes = { $in: size1 }
    }

    if (priceGreaterThan) {
        filters.price = { $gt: priceGreaterThan }
    }

    if (priceLessThan) {
        filters.price = { $lt: priceLessThan }
    }

    if (priceGreaterThan && priceLessThan) {
        filters.price = { $gt: priceGreaterThan, $lt: priceLessThan }
    }

if (priceSort) {
    priceSort = priceSort.toString()

    //sort = sort.toString()


    const sortValue = function (value) {
        return ["1", "-1"].indexOf(value) !== -1;
    };
    let value = sortValue(priceSort)


    if (!value) return res.status(400).send({ status: false, Message: "PriceSort will accept only 1 & -1" })

    sort = { price: priceSort }

}

    let getData = await productModel.find(filters).sort(sort)

    if (getData.length == 0) { return res.status(404).send({ status: false, message: "product not found or may be deleted" }) }

    return res.status(200).send({ status: true, count: getData.length, message: "products details", data: getData })
}


const getProductById = async function (req, res) {
    try {

        const productId = req.params.productId
        if (!vfy.isValidObjectId(productId)) 
            return res.status(400).send({ status: false, message: "Product Id is not valid" });

            const prodDetails = await productModel.findById({ _id : productId })
            if (!prodDetails)
               { return res.status(404).send({ status: false, message: "Product Id does not exist" }) }
    
       return res.status(200).send({status: true, message: "Success", data : prodDetails })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })

    }
}




let updateProduct = async function(req,res){

    try{

        let productId = req.params.productId;
        if(!vfy.isValid(productId)) return res.status(400).send({status:false, message:"Please provide a productId"});
        if(!vfy.isValidObjectId(productId)) return res.status(400).send({status:false, message:"Invalid ProductId"});

        // db call , to check this id is present in db or not
        let isProductIdExist = await productModel.findOne({_id:productId, isDeleted:false});
        if(!isProductIdExist) return res.status(404).send({status:false, message:`${productId} doesn't exists`});

        let data = JSON.parse(JSON.stringify(req.body));
        let files = req.files;

        // if(isBodyEmpty(data)) return res.status(400).send({status:false, message:"please provide some data for filteration"});

        if (vfy.isEmptyObject(req.body) && files == undefined) {
            return res.status(400).send({ status: false, message: "please provide some data for filteration" })
        }
        let {title,description , price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments}= data;
    
        let filter ={}
      
        if(title || title ==''){
            if(!vfy.isValid(title)) return res.status(400).send({status:false, message:"please provide valid title"});
            let isTitleExist = await productModel.findOne({title:title});
            if(isTitleExist) return res.status(409).send({status:false, message:`Please provide uniqe title ( ${title} ) name `})
            filter.title = vfy.removeSpaces(title)
        }

        if(description || description == ''){
            if(!vfy.isValid(description)) return res.status(400).send({status:false, message:"please provide valid title"});
            description = vfy.removeSpaces(description) 
            if(description == isProductIdExist.description) return res.status(400).send({status:false, message:" you provide same description as previous"})
            filter.description=description;
        }

        if(price || price ==''){
            if(!vfy.isValid(price)) return res.status(400).send({status:false, message:"Please provide price"});
            if(!vfy.IsNumeric(price)) return res.status(400).send({status:false, message:"price must be a number"});
            filter.price = removeSpaces(price) 
        }
        if(currencyId || currencyId==''){
            if(!vfy.isValid(currencyId)) return res.status(400).send({status:false, message:"CurrencyId tag is Required"}); 
            if(currencyId.toUpperCase()!="INR") return res.status(400).send({status:false, message:"Please provide currencyId only 'INR'"}); 
            if(currencyId==isProductIdExist.currencyId) return res.status(400).send({status:false, message:"already Available"})
            filter.currencyId=currencyId
        }
        if(currencyFormat || currencyFormat ==''){
            if(!vfy.isValid(currencyFormat)) return res.status(400).send({status:false, message:"CurrencyFormat tag is Required"});
            if(currencyFormat !="₹") return res.status(400).send({status:false, message:"Only Indian Currency ₹ accepted"});
            if(filter.currencyFormat==isProductIdExist.currencyFormat) return res.status(400).send({status:false, message:"already Available"})
            filter.currencyFormat=currencyFormat;
           
        }
        
        if(style || style == ''){
            if(!vfy.isValid(style)) return res.status(400).send({status:false, message:"Please provide valid data"});
            style=vfy.removeSpaces(style);
            if(style==isProductIdExist.style) return res.status(400).send({status:false, message:"already Available"}) 
            filter.style=style;
        }


        if(installments || installments == ''){
            if(!vfy.isValid(installments)) return res.status(400).send({status:false, message:"installments tag is required"}) 
            if(!vfy.IsNumuric(installments)) return res.status(400).send({status:false, message:"installments must be number"})
            if(installments==isProductIdExist.installments)return res.status(400).send({status:false, message:"already Available"})
            filter.installments = installments  
        }
        // yaha pr logic likhna hai .....
        if(availableSizes || availableSizes==''){

            let allSizes = availableSizes.split(",");
            let bool = await vfy.checkAllSizesForUpdate(allSizes,isProductIdExist.availableSizes);
            if(bool){
            availableSizes = [...isProductIdExist.availableSizes,...allSizes]
            filter.availableSizes= availableSizes
            }

         if(!bool) return res.status(400).send({ status:false, Message: 'Duplicates Values not Allowed or availableSizes allowed like [S,XS, M,X, L, XXL,XL] !' })

        }

        if(isFreeShipping || isFreeShipping==''){
            let boolArr = ["true", "false"]
            if(!boolArr.includes(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping type must be boolean"}) 
            if(isFreeShipping==isProductIdExist.isFreeShipping)return res.status(400).send({status:false, message:"already Available"})
            filter.isFreeShipping = isFreeShipping 
        }

       
        if(files && files.length>0){
            if(files.length==0) return res.status(400).send({ status: !true, message: "productImage is required" });
            if(!vfy.acceptFileType(files[0],'image/jpeg', 'image/png'))  return res.status(400).send({ status: false, message: "we accept jpg, jpeg or png as product image only" })
            
            // console.log(await uploadFile(files[0]))
            let myUrl = await uploadFile(files[0]);
            productImage=myUrl;
            if(productImage == isProductIdExist.productImage) return res.status(400).send({status:false, message:"This url is Already available"});
            filter.productImage = productImage
         
        }

        let updatedObject = await productModel.findOneAndUpdate({_id:productId},filter,{new:true})
        return res.status(200).send({status:true, message:'Success', data:updatedObject})
        
    }catch(error){
        res.status(500).send({status:false, message:error.message})
    }

}


const deleteProductById = async function (req, res) {
    try {
        
        const id = req.params.productId;
        if(!vfy.isValidObjectId(id)){
            return res.status(400).send({satus:false, message:"Please provide a valid id"
            })
        }

        const product = await productModel.findById(id);
         if (!product)
         { return res.status(404).send({ status: false, message: "no such product exists" }) }

         if (product.isDeleted === true)
         { return res.status(400).send({ status: false, message: "product already deleted" }) }
        //const date = new Date; 
        
        let delProduct= await productModel.findByIdAndUpdate(id, { $set: { isDeleted: true, deletedAt: Date.now() } },{new:true});
        return res.status(200).send({ status: true, message: "deleted successfully"});

    } catch (error) {
        return res.status(500).send({ status: false, error: error.name, msg: error.message })
    }   }


module.exports = { createProduct,getProduct, getProductById , updateProduct ,deleteProductById}