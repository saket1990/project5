const userModel = require('../models/userModel')
const vfy = require('../utility/validation')
const bcrypt = require('bcrypt'); // becrypt is used to encrypt as well comparig the given password with hash-one stored in db
const { uploadFile } = require('../aws.config.js')
const jwt = require('jsonwebtoken');
const saltRounds = 10;


//======================== #Post Api {Creat User} ==========================================>>

const createUser = async function (req, res) {
    try {
        const requestBody = req.body
        console.log(requestBody)
        if (vfy.isEmptyObject(requestBody)) return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
        
        let { fname, lname, email, phone, password, address } = requestBody

        const files = req.files

        if (vfy.isEmptyFile(files)) return res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
        
        if (vfy.isEmptyVar(fname)) return res.status(400).send({ status: false, Message: "Please provide user's first name" })
        fname =  vfy.removeSpaces(fname)
        if (!vfy.isValidString(fname)) return res.status(400).send({ status: false, message: "Please provide valid fname" })
   
        

        
        if (vfy.isEmptyVar(lname)) return res.status(400).send({ status: false, Message: "Please provide user's last name" })
           lname =  vfy.removeSpaces(lname)
        if (!vfy.isValidString(lname)) return res.status(400).send({ status: false, message: "Please provide valid lname" })
  

        if (vfy.isEmptyVar(email)) return res.status(400).send({ status: false, Message: "Please provide user's email" })
              email= vfy.removeSpaces(email)
        if (!vfy.isValidEmail(email)) return res.status(400).send({ status: false, Message: "please provide valid email" });
        
        if (vfy.isEmptyVar(phone)) return res.status(400).send({ status: false, Message: "Please provide phone number" })
        if (!vfy.isValidPhone(phone)) return res.status(400).send({ status: false, Message: "please provide valid phone number" });
        
        if (vfy.isEmptyVar(password)) return res.status(400).send({ status: false, Message: "Please provide password" })
        if (!vfy.isValidPassword(password)) return res.status(400).send({ status: false, Message: "Password must contain lenth between 8 - 15 with minimum 1 special character" })

        if (vfy.isEmptyVar(address)) return res.status(400).send({ status: false, Message: "Please provide address" })
            
        const addressObject = vfy.isValidJSONstr(address)
         
        if (!addressObject) return res.status(400).send({ status: false, Message: "Address json you are providing is not in a valid format " })

        let {
            shipping,
            billing
        } = addressObject

        // console.log(addressObject)




        // shipping address validation
        if (vfy.isEmptyObject(shipping)) return res.status(400).send({ status: false, Message: "Please provide shipping address" })
        if (vfy.isEmptyVar(shipping.street)) return res.status(400).send({ status: false, Message: "Plz provide shipping street..!!" });
        if (vfy.isEmptyVar(shipping.city)) return res.status(400).send({ status: false, Message: "Plz provide shipping city..!!" });
        if (!shipping.pincode || isNaN(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide shopping pincode" });
        if (!vfy.isPincodeValid(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode" });

        // billinf address validation

        if (vfy.isEmptyObject(billing)) return res.status(400).send({ status: false, Message: "Plz provide billing address.!!" });
        if (vfy.isEmptyVar(billing.street)) return res.status(400).send({ status: false, Message: "Plz provide billing street..!!" });
        if (vfy.isEmptyVar(billing.city)) return res.status(400).send({ status: false, Message: "Plz provide billing city..!!" });
        if (!billing.pincode || isNaN(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide billing pincode" });
        if (!vfy.isPincodeValid(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode" });







        //=================================Unique Db calls (Time saving)======================>>

        let usedEmail = await userModel.findOne({ email });
        if (usedEmail) return res.status(400).send({ status: false, Message: "This email is already registerd" });

        let usedMobileNumber = await userModel.findOne({ phone });
        if (usedMobileNumber) return res.status(400).send({ status: false, Message: "This Mobile no. is already registerd" });

        // ================================= qws file upload here==========================>>
        if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: false, Message: "we accept jpg, jpeg or png as profile picture only" });

        const profilePicture = await uploadFile(files[0])

        const encryptedPassword = await bcrypt.hash(password, saltRounds)
        const userrequestBody = { fname, lname, email, phone, profileImage: profilePicture, password: encryptedPassword, address: addressObject }
        // create user 
        const newUser = await userModel.create(userrequestBody);

        res.status(201).send({
            status: true,
            message: `User registered successfully`,
            data: newUser
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: false,
            Message: error.message
        })
    }
}


const login = async (req, res) => {
    try {
        // get data from body
        const data = req.body
        if (vfy.isEmptyObject(data)) return res.status(400).send({ status: !true, message: " Login BODY must be required!" })

        //  de-structure data ❤️
        let { email, password } = data;

        //  Basic validations
        if (vfy.isEmptyVar(email)) return res.status(400).send({ status: !true, message: " Email address must be required!" })

        if (!vfy.isValidEmail(email)) return res.status(400).send({ status: !true, message: " Invalid Email address!" })

        if (vfy.isEmptyVar(password)) return res.status(400).send({ status: !true, message: " Password must be required!" })

        //  db call for login and validation
        const user = await userModel.findOne({ email })

        if (!user) return res.status(404).send({ status: !true, message: ` ${email} - related user does't exist!` })

        //  vfy the password
        const verify = await bcrypt.compare(password, user.password).catch(_ => {
           
           
            console.log(_.message)
            return !true
        })

        if (!verify) return res.status(401).send({ status: !true, message: ` Wrong Email address or Password!` })

        //  generate Token one hr
        const Token = jwt.sign({
            userId: user._id
        }, 'secret', {
            expiresIn: '1h'
        });
        //console.log(Token.userId)
        //  all good
        res.status(200).send({
            status: true,
            message: `User Logged-in Successfully!`,
            data: {
                userId: user._id,
                token: Token
            }
        })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            status: !true,
            Message: error.message
        })
    }
}
const getUser = async function (req, res) {
    try {

        const userId = req.params.userId
        if (!isValidObjectId(userId)) 
            return res.status(400).send({ status: false, message: "User Id is not valid" });

            const profDetails = await userModel.findById({ _id : userId })
            if (!profDetails)
               { return res.status(404).send({ status: false, message: "User Id does not exist" }) }
            // console.log(req["decodedToken"])
            // if (req.headers["userId"] !== userId)
            if (req["decodedToken"] !== userId)
            return res.status(403).send({ status: false, msg: "User Id is not correct" })
    
       return res.status(200).send({status: true, message: "User profile details", data : profDetails })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })

    }
}

const update = async (req, res) => {
    try {
        //  get data from body
        const data = req.body
        //  console.log(data)
        const files = req.files
        console.log( files)
        const userId = req.params.userId
        
        //if(vfy.isEmptyObject(data) && vfy.isEmptyFile(files)) return res.status(400).send({ status: false, message: " BODY or file must be required!" })
        if (vfy.isEmptyObject(data) && files==undefined) return res.status(400).send({ status: !true, message: " invalid request...enter again!" })
        //  get User by userID

        if (!vfy.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please enter valid user Id" })
        }
        const user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: !true, message: " User data not found!" })

        //  de-structure data
        let { fname, lname, email, phone, password, address } = data
        
        console.log(data)
        
        if(fname){
            if(vfy.isEmptyVar(fname))
            return res.status(400).send({status:false , Message:"fname should not be empty"})
                
            user.fname=vfy.removeSpaces(fname);
            
            }
        
            if(lname){
                if(vfy.isEmptyVar(lname))
                return res.status(400).send({status:false , Message:"lname should not be empty"})
                    
                user.lname=vfy.removeSpaces(lname);
                
                }
            
        

        
        if (email) {
             
            if(vfy.isEmptyVar(email))return res.status(400).send({status:false, Message:"email should not be empty"})
            
            if (!vfy.isValidEmail(email)) return res.status(400).send({ status: !true, message: " Invalid email address!" })
            let usedEmail = await userModel.findOne({ email: email });
            
            if (usedEmail) return res.status(400).send({ status: false, Message: "This email is already registerd" });
               
            user.email = vfy.removeSpaces(email)
        }

        if (phone) {
            if(vfy.isEmptyVar(phone))return res.status(400).send({status:false, Message:"phone should not be empty"})
            if (!vfy.isValidPhone(phone)) return res.status(400).send({ status: !true, message: " Invalid phone number!" })
            let usedMobileNumber = await userModel.findOne({ _id: userId , phone });
            if (usedMobileNumber) return res.status(400).send({ status: false, Message: "This Mobile no. is already registerd" });

            user.phone = phone
        }

        if (password) {
            if(vfy.isEmptyVar(password))return res.status(400).send({status:false, Message:"password should not be empty"})
            if (!vfy.isValidPassword(password)) return res.status(400).send({ status: !true, message: " Please enter a valid password [A-Z] [a-z] [0-9] !@#$%^& and length with in 8-15" })
            const encryptedPassword = await bcrypt.hash(password, saltRounds)
            user.password = encryptedPassword
        }

        if (!vfy.isEmptyVar(address)) {
            let addressObj = vfy.isValidJSONstr(address)
            if (!addressObj) return res.status(400).send({ status: !true, message: " JSON address NOT in a valid structure, make it in a format!" })

            address = addressObj
            let {
                shipping,
                billing
            } = address

            // shipping address validation
            if (!vfy.isEmptyObject(shipping)) {
                if (vfy.isEmptyVar(shipping.street)) return res.status(400).send({status:false ,Message:"Plz provide a valid street for shipping"})
                    user.address.shipping.street = vfy.removeSpaces(shipping.street)
                

                if (vfy.isEmptyVar(shipping.city))  return res.status(400).send({status:false ,Message:"Plz provide a valid city for shipping"})
                if(!vfy.isValidString(shipping.city)) return res.status(400).send({status:false ,Message:"shipping city should only be characters"})    
                user.address.shipping.city =  vfy.removeSpaces(shipping.city)
                

                if (!shipping.pincode || !vfy.isPincodeValid(shipping.pincode)||  isNaN(shipping.pincode)  )
                     return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for shipping" });
                    user.address.shipping.pincode =  vfy.removeSpaces(shipping.pincode)
                
            }

            // billing address validation
            if (!vfy.isEmptyObject(billing)) {
                
                if (vfy.isEmptyVar(billing.street)) {console.log(billing.street) 
                    return res.status(400).send({status:false ,Message:"Plz provide a valid street for billing"})}
                    user.address.billing.street =  vfy.removeSpaces(billing.street)
                 
            
                if (vfy.isEmptyVar(billing.city)) return res.status(400).send({status:false ,Message:"Plz provide a valid city for billing"})
                    if(!vfy.isValidString(billing.city)) return res.status(400).send({status:false ,Message:"billing city should only be characters"})
                user.address.billing.city =  vfy.removeSpaces(billing.city)
                

                if (!billing.pincode || !vfy.isPincodeValid(billing.pincode)||  isNaN(shipping.pincode)  ) 
                   return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for billing" });
                   user.address.billing.pincode =  vfy.removeSpaces(billing.pincode)
                     
                
                
            }

        }

        if (!vfy.isEmptyFile(files)) {
            if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: false, Message: "we accept jpg, jpeg or png as profile picture only" });

            const profilePicture = await uploadFile(files[0])
            user.profileImage = profilePicture
        }

        await user.save()

        res.status(200).send({
            status: true,
            Message: "User Updated successfully!",
            data: user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: !true,
            Message: error.message
        })
    }
}



module.exports={createUser,login,getUser,update}
//module.exports.login = login