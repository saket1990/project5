const mongoose = require("mongoose")
const moment = require("moment")

let isEmptyObject = function (body) {
    if (!body) return true
    if (Object.keys(body).length == 0) return true;
    return false;
}

let isEmptyVar = function (value) {
    if(!value) return true
    if (typeof value === 'undefined' || value === null) return true;
    if (value.trim().length === 0) return true;
    return false;
}

const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0) return false 
    return true;
}



let isValidPhone = function (number) {
    let phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
}
function removeSpaces(x){
    return x.split(" ").filter((y)=> y ).join(" ")
}
let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}

let isValidPassword = function (password) {
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
}

let isValidDateFormat = function (date) {
    let dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    return dateFormatRegex.test(date)
}

let isValidDate = function (date) {
    return moment(date).isValid()
}

let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}


let isEmptyFile = (file) => {
    if (!file || file.length == 0) return true
    return false
}

const acceptFileType = (file, ...types) => {
    return types.indexOf(file.mimetype) !== -1 ? true : false
}

const isPincodeValid = function (value) {
    return /^[1-9]{1}[0-9]{5}$/.test(value);
}


let isValidJSONstr = (json) => {
    try {
        return JSON.parse(json)
    } catch (_) {
        return false
    }
}

let checkArrContent = (array, ...isContentArray) => {
    let count = 0
    array.forEach(e => {
        if (!isContentArray.includes(e)) count++
    });
    return count == 0 ? true : false
}

let checkAllSizes = function (allSizes,available){

    let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];

    for(let i=0;i<allSizes.length;i++){
        allSizes[i]=allSizes[i].trim();
      if(!arr.includes(allSizes[i])) return false
    }
    return true;
   
   }


   let checkAllSizesForUpdate = async function (allSizes,available){
    for(let i=0;i<allSizes.length;i++){
        allSizes[i]=allSizes[i].trim();
      if(!arr.includes(allSizes[i])) return false
      if(available.includes(allSizes[i])) return false
    }
    return true;
   }



let IsNumeric = function (input) {
	var RE = /^-{0,1}\d*\.{0,1}\d+$/;
	return (RE.test(input));
}

function isValidString(x){
    if(typeof x != "string") return false;
    const regEx = /^\s*[a-zA-Z]+(\.[a-zA-Z\s]+)*[a-zA-Z\s]\s*$/;
    console.log(regEx.test(x)) 
    return regEx.test(x)
}

module.exports = {
    isEmptyObject,
    isEmptyVar,
    isValid,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidDateFormat,
    isValidDate,
    isEmptyFile,
    removeSpaces,
    acceptFileType,
    isValidJSONstr,
    isPincodeValid,
    checkArrContent,
    checkAllSizes,
    checkAllSizesForUpdate,
    IsNumeric,
    isValidString
}