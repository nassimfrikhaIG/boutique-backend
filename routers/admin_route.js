// const route=require('express').Router()
// const admin_model=require('../models/admin')



// route.post('/registre',(req,res,next)=>{

//     admin_model.registreAdmin(req.body.username,req.body.email,req.body.password)
//     .then((user)=>res.status(200).json({user:user,msg:"registred"}))
//     .catch((err)=>res.status(400).json({Error:err,msg:"s'ils vous plait enter autre email"}))

//     })

//     route.post('/login',(req,res,next)=>{

//         admin_model.loginAdmin(req.body.email,req.body.password)
//         .then((token)=>res.status(200).json({token:token}))
//         .catch((err)=>res.status(400).json({Error:err}))
    
//         })
// module.exports=route