const route = require('express').Router();
const jwt = require('jsonwebtoken');
const { 
    addToWishlist, 
    removeFromWishlist, 
    getUserWishlist, 
    getMostWishedProducts 
} = require('../models/whishlist');

const privatekey = 'this is my secret key';

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


// Ajouter un produit à la wishlist
route.post('/wishlist/add',verifyToken, (req, res) => {
    addToWishlist(req.body.userId, req.body.productId)
        .then((doc) => res.status(200).json(doc))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// Supprimer un produit ou vider la wishlist
route.delete('/wishlist/remove',verifyToken, (req, res) => {
    const { userId, productId } = req.body;
    
    // Si productId est fourni, on supprime un produit spécifique, sinon on vide la wishlist
    removeFromWishlist(userId, productId)
      .then((doc) => res.status(200).json(doc))  // Retourne la wishlist mise à jour
      .catch((err) => res.status(400).json({ error: err.message }));  // Retourne l'erreur en cas d'échec
  });
  
route.get('/wishlist/user',verifyToken, (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ msg: "L'ID de l'utilisateur est requis." });
    }
    getUserWishlist(userId)
      .then((doc) => res.status(200).json(doc))  // Retourner les informations formatées de la wishlist
      .catch((err) => res.status(400).json({ error: err.message }));
  });
  
//for admin
// Obtenir les produits les plus ajoutés en wishlist
route.get('/wishlist/most-wished', (req, res) => {
    getMostWishedProducts()
        .then((doc) => res.status(200).json(doc))
        .catch((err) => res.status(400).json({ error: err.message }));
});

module.exports = route;
