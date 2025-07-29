const express = require('express');
const router = express.Router();
const { postNewCategorie, getAllCategories, deleteCategorie } = require('../models/categories');

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

// Ajouter une catégorie
router.post('/categories', async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: "Le champ 'name' est requis" });
    }

    try {
        const doc = await postNewCategorie(req.body.name);
        res.status(201).json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer toutes les catégories
router.get('/categories', async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer une catégorie par ID
router.delete('/categories/:id', async (req, res) => {
    try {
        const message = await deleteCategorie(req.params.id);
        res.status(200).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
