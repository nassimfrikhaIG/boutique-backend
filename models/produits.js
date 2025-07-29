const mongoose = require('mongoose');
const { Categorie } = require('../models/categories'); 


let schema_produit = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    available: { type: String, default: 'En stock' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie' }, // Relation avec la catégorie
    image: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

var Produit = mongoose.model('Produit', schema_produit);

var url = 'mongodb://localhost:27017/shop';

// Ajouter un produit en utilisant le nom de la catégorie
const postNewProduit = (name, description, price, stock, category, image) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return Produit.findOne({ name }); // Vérifier si le produit existe déjà
            })
            .then((existingProduct) => {
                if (existingProduct) {
                    throw new Error("Ce produit existe déjà !");
                }
                return Categorie.findOne({ name: category });
            })
            .then((categorie) => {
                if (!categorie) {
                    throw new Error("Catégorie introuvable !");
                }

                let produit = new Produit({
                    name,
                    description,
                    price,
                    stock,
                    category: categorie._id,
                    image,
                    available: stock > 0 ? "En stock" : "Rupture de stock"
                });

                return produit.save();
            })
            .then((doc) => {
                mongoose.disconnect();
                resolve(doc);
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};


// Récupérer tous les produits avec le nom de la catégorie
const GetAllProduit = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return Produit.find().populate('category', 'name'); // Recherche des produits avec leur catégorie
            })
            .then((doc) => {
                // Modifier l'état de la disponibilité des produits avant de les retourner
                const updatedProducts = doc.map((produit) => {
                    produit.available = produit.stock > 0 ? "En stock" : "Rupture de stock";
                    return produit;
                });
                mongoose.disconnect();
                resolve(updatedProducts);
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};


// Récupérer un seul produit avec le nom de la catégorie
const GetOneProduit = (id) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return Produit.findById(id).populate('category', 'name'); // Recherche du produit avec sa catégorie
            })
            .then((doc) => {
                if (doc) {
                    // Modifier l'état de la disponibilité du produit
                    doc.available = doc.stock > 0 ? "En stock" : "Rupture de stock";
                    mongoose.disconnect();
                    resolve(doc);
                } else {
                    mongoose.disconnect();
                    reject("Produit introuvable");
                }
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

// Supprimer un produit
const deleteOneProduit = (id) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return Produit.deleteOne({ _id: id });
            })
            .then((doc) => {
                mongoose.disconnect();
                resolve(doc);
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

// Mettre à jour un produit et garder le nom de la catégorie
const updateOneProduit = (id, name, description, price, stock, available, categoryName, image) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return Categorie.findOne({ name: categoryName });
            })
            .then((categorie) => {
                if (!categorie) {
                    throw new Error("Catégorie introuvable !");
                }

                return Produit.findOne({
                    name,
                    description,
                    price,
                    stock,
                    category: categorie._id,
                    image,
                    _id: { $ne: id } // Vérifie si un autre produit (différent de celui qu'on modifie) existe déjà
                });
            })
            .then((existingProduct) => {
                if (existingProduct) {
                    throw new Error("Un autre produit avec ces mêmes informations existe déjà !");
                }

                return Produit.findByIdAndUpdate(
                    id,
                    {
                        name,
                        description,
                        price,
                        stock,
                        available: stock > 0 ? "En stock" : "Rupture de stock",
                        category: categoryName._id,
                        image,
                        updatedAt: Date.now()
                    },
                    { new: true }
                ).populate('category', 'name');
            })
            .then((doc) => {
                mongoose.disconnect();
                if (doc) {
                    resolve(doc);
                } else {
                    reject("Produit introuvable");
                }
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

const searchProduit = async (query) => {
    try {
        await mongoose.connect(url);
        const produits = await Produit.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        }).populate('category', 'name');
        return produits;
    } finally {
        mongoose.disconnect();
    }
};
// Fonction qui récupère les nouveautés et retourne une promesse
// const getNouveautes = async () => {
//     try {
//         await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//         const nouveautes = await Produit.find()
//             .sort({ createdAt: -1 }) // Trier par date décroissante
//             .limit(10)
//             .populate('category', 'name'); // Limiter à 10 produits
//         return nouveautes;
//     } catch (error) {
//         throw error;
//     } finally {
//         mongoose.disconnect();
//     }
// };
// Add this new function to your produits.js model file

const filterProduits = async (categoryId, minPrice, maxPrice) => {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        
        // Build filter object
        let filter = {};
        
        // Add category filter if provided
        if (categoryId) {
            filter.category = categoryId;
        }
        
        // Add price range filter if provided
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) {
                filter.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice !== undefined) {
                filter.price.$lte = parseFloat(maxPrice);
            }
        }
        
        // Get filtered products with populated category
        const produits = await Produit.find(filter).populate('category', 'name');
        
        // Update availability status based on stock
        const updatedProducts = produits.map((produit) => {
            produit.available = produit.stock > 0 ? "En stock" : "Rupture de stock";
            return produit;
        });
        
        return updatedProducts;
    } catch (error) {
        throw error;
    } finally {
        mongoose.disconnect();
    }
};
module.exports = {
    Produit,
    postNewProduit,
    GetAllProduit,
    GetOneProduit,
    deleteOneProduit,
    updateOneProduit,
    searchProduit,
    filterProduits
};
