const mongoose = require('mongoose');
const { Produit } = require('../models/produits');
const { user } = require('../models/user'); 

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    isValidated: { type: Boolean, default: false }
  }, { timestamps: true });
  
  
  var Review=mongoose.model('Review', ReviewSchema);
  var url='mongodb://localhost:27017/shop'
  
  // Ajouter une review (Utilisateur)
exports.addReview = (userId, productId, rating, comment) => {
  return new Promise((resolve, reject) => {
      mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
          .then(() => Produit.findById(productId))
          .then((product) => {
              if (!product) {
                  mongoose.disconnect();
                  return reject("Produit non trouvé");
              }
              const review = new Review({
                  user: userId,
                  product: productId,
                  rating,
                  comment
              });
              return review.save();
          })
          .then((review) => {
              mongoose.disconnect();
              resolve(review);
          })
          .catch((err) => {
              mongoose.disconnect();
              reject(err);
          });
  });
};

// Voir les reviews d’un produit (Utilisateur)
exports.getReviewsByProduct = (productId) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => Review.find({ product: productId }) // Supprimé `isValidated: true`
                .populate('user', 'username'))
            .then((reviews) => {
                mongoose.disconnect();
                resolve(reviews);
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

// Voir toutes les reviews (Admin)
exports.getAllReviews = () => {
  return new Promise((resolve, reject) => {
      mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
          .then(() => Review.find().populate('user', 'username').populate('product', 'name'))
          .then((reviews) => {
              mongoose.disconnect();
              resolve(reviews);
          })
          .catch((err) => {
              mongoose.disconnect();
              reject(err);
          });
  });
};

// Valider une review (Admin)
exports.validateReview = (reviewId) => {
  return new Promise((resolve, reject) => {
      mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
          .then(() => Review.findByIdAndUpdate(reviewId, { isValidated: true }, { new: true }))
          .then((review) => {
              mongoose.disconnect();
              resolve(review);
          })
          .catch((err) => {
              mongoose.disconnect();
              reject(err);
          });
  });
};

// Supprimer une review (Admin)
exports.deleteReview = (reviewId) => {
  return new Promise((resolve, reject) => {
      mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
          .then(() => Review.findByIdAndDelete(reviewId))
          .then((review) => {
              mongoose.disconnect();
              resolve({ message: "Review supprimée", review });
          })
          .catch((err) => {
              mongoose.disconnect();
              reject(err);
          });
  });
};