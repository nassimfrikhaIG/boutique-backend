const express = require("express");
const { addOffre, getOffre, updateOffre, deleteOffre } = require('../models/offre');
const router = express.Router();
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

// Ajouter une nouvelle offre du jour
router.post("/offre", (req, res) => {
    const { productId, discount, expiresAt } = req.body;

    addOffre(productId, discount, expiresAt)
        .then(deal => res.status(201).json(deal))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Récupérer l'offre du jour actuelle avec les informations supplémentaires
router.get("/offre", (req, res) => {
    getOffre()
        .then(deal => res.status(200).json(deal))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.patch("/offre/:id", (req, res) => {
    const { id } = req.params;
    const { discount, expiresAt } = req.body; // Récupère uniquement les champs nécessaires

    updateOffre(id, discount, expiresAt)
        .then(deal => res.status(200).json(deal))
        .catch(err => res.status(400).json({ error: err.message }));
});


// Supprimer une offre du jour
router.delete("/offre/:id", (req, res) => {
    const { id } = req.params;

    deleteOffre(id)
        .then(message => res.status(200).json({ message }))
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
