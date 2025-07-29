const mongoose = require("mongoose");
const { Produit } = require("../models/produits");
const { categorie } = require("../models/categories");

const url = 'mongodb://localhost:27017/shop';

// Définition du schéma pour les offres du jour
const schema_offre = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true },
    discount: { type: Number, required: true }, // % de réduction
    expiresAt: { type: Date, required: true } // Date d'expiration du deal
});

const Offre = mongoose.model("Offre", schema_offre);

// Ajouter une nouvelle offre du jour
const addOffre = (productId, discount, expiresAt) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                // Enlever la vérification de l'existence d'une offre en cours
                return new Offre({ productId, discount, expiresAt }).save();
            })
            .then(deal => {
                mongoose.disconnect();
                resolve(deal);
            })
            .catch(err => {
                mongoose.disconnect();
                reject(err);
            });
    });
};


const getOffre = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() =>
                // Utilisation de `populate` pour récupérer les informations nécessaires du produit et de sa catégorie
                Offre.find({ expiresAt: { $gte: new Date() } })
                    .populate({
                        path: "productId",  // Populer le champ 'productId'
                        select: "name image price category",  // Sélectionner les champs nécessaires du produit
                        populate: { 
                            path: "category", // Populer le champ 'category' du produit
                            select: "name" // Ne sélectionner que le nom de la catégorie
                        }
                    })
            )
            .then(deals => {
                mongoose.disconnect();
                // Si l'offre contient un produit, la catégorie sera peuplée avec son nom
                resolve(deals.length > 0 ? deals : "Aucune offre du jour disponible.");
            })
            .catch(err => {
                mongoose.disconnect();
                reject(err);
            });
    });
};
// Au lieu de se connecter/déconnecter à chaque fois
// const getOffre = () => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         // Vérifie l'état de la connexion
//         if (mongoose.connection.readyState !== 1) {
//           await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//         }
        
//         const offres = await Offre.find({ expiresAt: { $gte: new Date() } })
//           .populate({
//             path: "productId",
//             select: "name image price category",
//             populate: {
//               path: "category",
//               select: "name"
//             }
//           });
        
//         resolve(offres.length > 0 ? offres : []);
//       } catch (err) {
//         reject(err);
//       }
//     });
//   };

const updateOffre = (id, discount, expiresAt) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => Offre.findByIdAndUpdate(
                id, 
                { discount, expiresAt }, 
                { new: true } // Retourne l'objet mis à jour
            ))
            .then(deal => {
                mongoose.disconnect();
                resolve(deal || "Offre non trouvée.");
            })
            .catch(err => {
                mongoose.disconnect();
                reject(err);
            });
    });
};


// Supprimer une offre du jour
const deleteOffre = (id) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => Offre.findByIdAndDelete(id))
            .then(deal => {
                mongoose.disconnect();
                resolve(deal ? "Offre supprimée avec succès" : "Offre non trouvée");
            })
            .catch(err => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

module.exports = {
    Offre,
    addOffre,
    getOffre,
    updateOffre,
    deleteOffre
};
