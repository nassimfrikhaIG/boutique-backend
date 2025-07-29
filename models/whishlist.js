const mongoose=require('mongoose')
const { Produit } = require('../models/produits');
const { user } = require('../models/user');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },  // Utilisation correcte de 'user'
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }]  // Tablo des produits
}, { timestamps: true });  // Utilisation des timestamps pour les dates d'ajout

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

  var url = 'mongodb://localhost:27017/shop';
    
  // Ajouter un produit à la wishlist
// Ajouter un produit à la wishlist
const addToWishlist = (userId, productId) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        return Wishlist.findOneAndUpdate(
          { user: userId },  // Chercher la wishlist de l'utilisateur
          { $addToSet: { products: productId } },  // Ajoute le produit à la liste sans duplications
          { new: true, upsert: true }  // Si aucune wishlist n'existe, en crée une nouvelle
        );
      })
      .then(doc => {
        mongoose.disconnect();
        resolve(doc);
      })
      .catch(err => {
        mongoose.disconnect();
        reject(err);
      });
  });
};


const removeFromWishlist = (userId, productId = null) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        // Si productId est passé, on supprime ce produit spécifique, sinon on vide la wishlist
        if (productId) {
          return Wishlist.findOneAndUpdate(
            { user: userId },  // Utilise l'ID de l'utilisateur pour identifier la wishlist
            { $pull: { products: productId } },  // Supprime le produit spécifique de la liste
            { new: true }
          );
        } else {
          return Wishlist.findOneAndUpdate(
            { user: userId },  // Utilise l'ID de l'utilisateur pour identifier la wishlist
            { $set: { products: [] } },  // Vide tous les produits de la wishlist
            { new: true }
          );
        }
      })
      .then(doc => {
        mongoose.disconnect();
        resolve(doc);  // Retourne la wishlist mise à jour (vide ou avec produits supprimés)
      })
      .catch(err => {
        mongoose.disconnect();
        reject(err);  // Retourne l'erreur si elle survient
      });
  });
};


const getUserWishlist = (userId) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log(`Recherche de la wishlist pour l'utilisateur : ${userId}`);
        return Wishlist.findOne({ user: userId }).populate({
          path: 'products',
          select: 'name image price createdAt category',
          populate: {
            path: 'category', // Récupération du nom de la catégorie
            select: 'name'
          }
        });
      })
      .then(doc => {
        mongoose.disconnect();
        console.log('Réponse de la wishlist:', doc);
        if (doc && doc.products && doc.products.length > 0) {
          const wishlistData = doc.products.map(product => ({
            id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            createdAt: product.createdAt,
            category: product.category ? product.category.name : "Inconnu" // Vérification et affichage du nom de la catégorie
          }));
          resolve(wishlistData);
        } else {
          resolve([]); // Si aucun produit n'est trouvé dans la wishlist
        }
      })
      .catch(err => {
        mongoose.disconnect();
        console.error('Erreur lors de la récupération de la wishlist:', err);
        reject(err);
      });
  });
};




const getMostWishedProducts = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        return Wishlist.aggregate([
          { $unwind: "$products" },  // Déplie les produits dans un tableau plat
          { $group: { _id: "$products", count: { $sum: 1 } } },  // Compte le nombre de fois qu'un produit a été ajouté
          { $sort: { count: -1 } },  // Trie les produits par ordre décroissant du nombre de fois où ils ont été ajoutés
          { $limit: 10 },  // Limite à 10 produits les plus ajoutés
          {
            $lookup: {  // Jointure avec le modèle Produit pour récupérer les informations complètes
              from: 'produits',  // Le nom de ta collection pour les produits
              localField: '_id',  // Le champ d'agrégation, c'est-à-dire les ID des produits
              foreignField: '_id',  // Le champ dans la collection Produit qui correspond à ces IDs
              as: 'productDetails'  // Le champ où seront stockées les informations des produits
            }
          },
          { $unwind: "$productDetails" }  // Déplie les détails des produits dans un objet
        ]);
      })
      .then(docs => {
        mongoose.disconnect();
        resolve(docs);  // Renvoyer les produits peuplés avec leurs informations
      })
      .catch(err => {
        mongoose.disconnect();
        reject(err);
      });
  });
};


  
  module.exports = {
      addToWishlist,
      removeFromWishlist,
      getUserWishlist,
      getMostWishedProducts
  };
  