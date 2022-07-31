const express = require("express")
const mongoose = require("mongoose")
const route = require('./routes/route')
const multer = require("multer")
const app = express()

app.use (express.json())
app.use(multer().any())
mongoose.connect("mongodb+srv://pallavi_90:eh5J7PzhYvWnStqo@cluster0.hznxhdd.mongodb.net/group60Database", {useNewUrlParser: true})
 .then(() => console.log("MongoDb is connected"))
 .catch(err => console.log(err))

 app.use('/',route);
app.listen(4000, function(){
    console.log('express app running on port' + 4000)
})
