const route = require('express').Router();
const { postNewProduit, GetAllProduit, GetOneProduit, deleteOneProduit, updateOneProduit,searchProduit,filterProduits } = require('../models/produits');

const jwt=require('jsonwebtoken')

const multer = require('multer');
const path = require('path');


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

// Définir l'emplacement où stocker les images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');  // Dossier 'uploads' où les images seront stockées
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Créer un nom unique pour l'image
    }
});

const upload = multer({ dest: 'uploads/' });


route.post('/addProduit', upload.single('image'), (req, res) => {
    // Vérifier si un fichier a été téléchargé ou si l'image a été envoyée en URL
    let imageUrl = req.body.image || '';  // Si une URL est fournie, utilisez-la.

    // Si un fichier a été téléchargé, mettez à jour l'URL de l'image avec le chemin du fichier
    if (req.file) {
        imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
        return res.status(400).json({ error: "Aucune image téléchargée et aucune URL fournie" });
    }

    // Ajoutez le produit avec l'URL de l'image
    postNewProduit(
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.stock,
        req.body.category,
        imageUrl  // Utilisez l'URL de l'image dans la base de données
    )
    .then(doc => res.send(doc))
    .catch(err => res.status(400).json({ error: err.message }));
});



route.get('/Produit', (req, res) => {
    GetAllProduit()
        .then((doc) => {
            // Si vous voulez un contrôle supplémentaire pour afficher correctement la disponibilité
            const updatedProducts = doc.map((produit) => {
                produit.available = produit.stock > 0 ? "En stock" : "Rupture de stock";
                return produit;
            });
            res.send(updatedProducts);  // Renvoi des produits avec la disponibilité mise à jour
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

route.get('/Produit/:id',(req, res, next) => {
    GetOneProduit(req.params.id)
        .then((doc) => {
            if (doc) {
                // Mise à jour de la disponibilité avant de renvoyer le produit
                doc.available = doc.stock > 0 ? "En stock" : "Rupture de stock";
                res.send(doc);
            } else {
                res.status(404).json({ message: "Produit introuvable" });
            }
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});




route.delete('/Produit/:id', (req, res, next) => {
    deleteOneProduit(req.params.id)
        .then((doc) => res.send(doc))
        .catch((err) => res.status(400).json(err));
});

route.patch('/Produit/:id', (req, res) => {
    updateOneProduit(
        req.params.id,
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.stock,
        req.body.stock > 0,
        req.body.category,
        req.body.image
    )
    .then((doc) => res.status(200).json(doc))
    .catch((err) => res.status(400).json({ error: err.message }));
});

route.get('/searchProduit/:query', async (req, res) => { 
    try {
        const produits = await searchProduit(req.params.query);

        // Si aucun produit n'est trouvé, retourne une erreur avec un message approprié
        if (produits.length === 0) {
            return res.status(404).json({ error: `Aucun produit trouvé pour la recherche : ${req.params.query}` });
        }

        // Sinon, renvoie les produits trouvés
        res.send(produits);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



// // Route pour récupérer les nouveautés
// route.get('/nouveautes', async (req, res) => {
//     try {
//         const nouveautes = await getNouveautes();
//         if (!nouveautes || nouveautes.length === 0) {
//             return res.status(404).json({ message: "Aucune nouveauté disponible" });
//         }
//         res.status(200).json(nouveautes);
//     } catch (err) {
//         console.error('Erreur lors de la récupération des nouveautés:', err);
//         res.status(500).json({ error: 'Erreur lors de la récupération des nouveautés', details: err.message });
//     }
// });

route.get('/filter', async (req, res) => {
    try {
        const { categoryId, minPrice, maxPrice } = req.query;
        
        // Call the filter function with the provided query parameters
        const filteredProducts = await filterProduits(categoryId, minPrice, maxPrice);
        
        // Return error if no products found
        if (filteredProducts.length === 0) {
            return res.status(404).json({ 
                message: "Aucun produit trouvé correspondant aux critères de filtrage" 
            });
        }
        
        // Return filtered products
        res.status(200).json(filteredProducts);
    } catch (err) {
        console.error('Erreur lors du filtrage des produits:', err);
        res.status(500).json({ 
            error: 'Erreur lors du filtrage des produits', 
            details: err.message 
        });
    }
});

module.exports = route
