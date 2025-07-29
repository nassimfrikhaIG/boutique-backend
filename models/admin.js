// const mongoose=require('mongoose')
// const jwt=require('jsonwebtoken')
// const bcrypt = require("bcrypt");

// let schema_admin=mongoose.Schema({

//     username:String,
//     email:String,
//     password:String
    
// })

// var Admin=mongoose.model('admin',schema_admin)
// var url='mongodb://localhost:27017/shop'



// exports.registreAdmin=(username,email,password)=>{

//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
           
//             return Admin.findOne({email:email})


//         }).then((doc)=>{
//             if(doc){
//                 mongoose.disconnect()
//                 reject('this email is exist')
//             }else{
//                 bcrypt.hash(password,10).then((hashedpassword)=>{
//                     let user =new Admin ({
//                         username:username,
//                         email:email,
//                         password:hashedpassword
//                     })
//                     user.save().then((user)=>{
//                         mongoose.disconnect()
//                         resolve(user)
//                     }).catch((err)=>{

//                         mongoose.disconnect()
//                         reject(err)
//                     })
//                 }).catch((err)=>{
//                     mongoose.disconnect()
//                     reject(err)
//                 })
//             }
//         })
//     })



// }

// var privatekey='this is my secret key'

// exports.loginAdmin=(email,password)=>{

//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
           
//             return Admin.findOne({email:email})


//         }).then((user)=>{
//             if(!user){
//                 mongoose.disconnect()
//                 reject('this email is not exist')
//             }else{
//                 bcrypt.compare(password,user.password).then((same)=>{
//                    if(same){
//                       //send token
//                     let token=jwt.sign({
//                         id:user._id,
//                         username:user.username,
//                         email:user.email,
//                         role:'Admin'
//                     },privatekey,{
//                         expiresIn:'1d',
//                     })
//                     mongoose.disconnect()
//                     resolve({token:token,role:'Admin',username:user.username})


//                     }else{
//                         mongoose.disconnect()
//                         reject('invalid password')
//                     }
                    
//                 }).catch((err)=>{
//                     mongoose.disconnect()
//                     reject(err)
//                 })
//             }
//         })
//     })



// }