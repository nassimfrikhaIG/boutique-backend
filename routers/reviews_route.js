const express = require('express');
const router = express.Router();
const reviewController = require('../models/reviews');
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

router.post('/add',verifyToken, (req, res) => {
    const { user, product, rating, comment } = req.body; // Récupérer userId du body

    if (!user || !product || !rating) {
        return res.status(400).json({ error: "Tous les champs (user, product, rating) sont obligatoires !" });
    }

    reviewController.addReview(user, product, rating, comment)
        .then((review) => res.status(200).json({ review, message: "Review ajoutée, en attente de validation" }))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// Voir les reviews d’un produit (Utilisateur)
router.get('/product/:productId', (req, res) => {
    reviewController.getReviewsByProduct(req.params.productId)
        .then((reviews) => res.status(200).json(reviews))
        .catch((err) => res.status(400).json({ error: err }));
});

// Voir toutes les reviews (Admin)
router.get('/all', (req, res) => {
    reviewController.getAllReviews()
        .then((reviews) => res.status(200).json(reviews))
        .catch((err) => res.status(400).json({ error: err }));
});

// Valider une review (Admin)
router.patch('/validate/:id', (req, res) => {
    reviewController.validateReview(req.params.id)
        .then((review) => res.status(200).json({ review, message: "Review validée" }))
        .catch((err) => res.status(400).json({ error: err }));
});

// Supprimer une review (Admin)
router.delete('/delete/:id', (req, res) => {
    reviewController.deleteReview(req.params.id)
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(400).json({ error: err }));
});

module.exports = router;
