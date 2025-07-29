const route = require('express').Router();
const contact_model = require('../models/contact');
const jwt=require('jsonwebtoken')


var privatekey='this is my secret key'

verifyToken=(req,res,next)=>{

    let token=req.headers.authorization
    if(!token){
        res.status(400).json({msg:'access rejected .... !!!' })
    }
    try{

        jwt.verify(token,privatekey)
        next()
    }catch(e){
        res.status(400).json({msg:e })

    }
}
verifyTokenAdmin=(req,res,next)=>{

    let token=req.headers.authorization
    let role=req.headers.role

    if(!token||role!='Admin'){
        res.status(400).json({msg:'access rejected .... !!!' })
    }
    try{

        jwt.verify(token,privatekey)
        next()
    }catch(e){
        res.status(400).json({msg:e })

    }
}

// Route to handle submitting a new contact form
route.post('/contact',verifyToken, (req, res, next) => {
    contact_model.saveContact(req.body.name, req.body.email, req.body.subject, req.body.message)
        .then((contact) => res.status(200).json({ contact: contact, msg: "Message sent successfully" }))
        .catch((err) => res.status(400).json({ Error: err, msg: "Please try again" }));
});

// Route pour récupérer tous les contacts (pour l'admin)
route.get('/contacts', (req, res, next) => {
    contact_model.getAllContacts()
        .then((contacts) => res.status(200).json({ contacts: contacts }))  // Retourne les contacts sous la clé 'contacts'
        .catch((err) => res.status(400).json({ Error: err }));
});
route.delete('/contacts/:id', (req, res, next) => {
    const { id } = req.params;
    
    contact_model.deleteContact(id)
        .then(() => res.status(200).json({ msg: "Contact supprimé avec succès" }))
        .catch((err) => res.status(400).json({ Error: err, msg: "Erreur lors de la suppression du contact" }));
});
module.exports = route;
