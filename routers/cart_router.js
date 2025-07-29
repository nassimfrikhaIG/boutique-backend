const route = require('express').Router();
const {
    addToCart,
    getCart,
    removeFromCart,
    clearCart,
    updateQuantity 
} = require('../models/cart');
const jwt = require('jsonwebtoken');
const { Produit } = require('../models/produits'); // Importez le modèle de produit

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

// Ajouter un produit au panier
// route.post('/addToCart', async (req, res) => {
//     try {
//         const cartItem = await addToCart(
//             req.body.userId,
//             req.body.productId,
//             req.body.quantity
//         );
//         res.status(200).json(cartItem);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
// In the router file for cart routes
route.post('/addToCart', async (req, res) => {
    try {
        const cartItem = await addToCart(
            req.body.userId,
            req.body.productId,
            req.body.quantity,
            req.body.price // Add this parameter
        );
        res.status(200).json(cartItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Récupérer le panier d'un utilisateur
route.get('/cart/:userId', async (req, res) => {
    try {
        const cart = await getCart(req.params.userId);
        res.status(200).json(cart); // Le panier avec le total
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Ajoutez cette route dans votre fichier de routes API pour les produits

route.get('/produits/:productId', async (req, res) => {
    try {
        const product = await Produit.findById(req.params.productId)
            .populate('category', 'name');
        
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Supprimer un produit du panier
route.delete('/cart/:userId/:productId', async (req, res) => {
    try {
        const updatedCart = await removeFromCart(req.params.userId, req.params.productId);
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Vider complètement le panier
route.delete('/clearCart/:userId', async (req, res) => {
    try {
        const clearedCart = await clearCart(req.params.userId);
        res.status(200).json({ msg: 'Panier vidé avec succès', cart: clearedCart });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
route.patch('/updateQuantity/:userId/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity <= 0) {
            return res.status(400).json({ error: 'La quantité doit être supérieure à zéro' });
        }
        
        const updatedCart = await updateQuantity(req.params.userId, req.params.productId, quantity);
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
module.exports = route;
