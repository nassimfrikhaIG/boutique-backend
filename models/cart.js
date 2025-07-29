const mongoose = require('mongoose');
const { Produit } = require('../models/produits');
const { users } = require('../models/user');


const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Prix réduit

    }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
const url = 'mongodb://localhost:27017/shop';

// Ajouter un produit au panier
// const addToCart = (userId, productId, quantity) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//             let cart = await Cart.findOne({ user: userId });
//             if (!cart) {
//                 cart = new Cart({ user: userId, items: [] });
//             }

//             const existingItem = cart.items.find(item => item.product.toString() === productId);
//             if (existingItem) {
//                 existingItem.quantity += quantity;
//             } else {
//                 cart.items.push({ product: productId, quantity });
//             }

//             await cart.save();
//             mongoose.disconnect();
//             resolve(cart);
//         } catch (err) {
//             mongoose.disconnect();
//             reject(err);
//         }
//     });
// };



// In the cart.js model file
const addToCart = (userId, productId, quantity, price) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            // Get product information
            const product = await Produit.findById(productId);
            if (!product) {
                mongoose.disconnect();
                return reject("Produit introuvable");
            }
            
            // Use the provided price or default to product price
            const itemPrice = price || product.price;
            
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                cart = new Cart({ user: userId, items: [] });
            }

            const existingItem = cart.items.find(item => item.product.toString() === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
                // Update price if a discounted price was provided
                if (price) {
                    existingItem.price = itemPrice;
                }
            } else {
                cart.items.push({ 
                    product: productId, 
                    quantity,
                    price: itemPrice
                });
            }

            await cart.save();
            mongoose.disconnect();
            resolve(cart);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};
// Supprimer un produit du panier
const removeFromCart = (userId, productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                mongoose.disconnect();
                return reject("Panier introuvable");
            }

            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            mongoose.disconnect();
            resolve(cart);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Vider complètement le panier
const clearCart = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            await Cart.deleteOne({ user: userId });
            mongoose.disconnect();
            resolve("Panier vidé avec succès");
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// const getCart = (userId) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
//             const cart = await Cart.findOne({ user: userId })
//                 .populate({
//                     path: 'items.product',
//                     select: 'name price image category',
//                     populate: {
//                         path: 'category', // Assurez-vous que `category` est bien un ObjectId référencé
//                         select: 'name' // Récupère uniquement le nom de la catégorie
//                     }
//                 });
  
//             if (!cart) {
//                 mongoose.disconnect();
//                 return resolve({ total: 0, items: [] }); // Si le panier est vide, retournez un total de 0
//             }
  
//             // Calcul du total
//             let total = 0;
//             cart.items.forEach(item => {
//                 total += item.quantity * item.product.price; // Multipliez la quantité par le prix de chaque produit
//             });
  
//             mongoose.disconnect();
//             resolve({ ...cart.toObject(), total }); // Ajoutez le total au panier
//         } catch (err) {
//             mongoose.disconnect();
//             reject(err);
//         }
//     });
//   };
  
// In the cart.js model file, update the getCart function
const getCart = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
            const cart = await Cart.findOne({ user: userId })
                .populate({
                    path: 'items.product',
                    select: 'name price image category',
                    populate: {
                        path: 'category',
                        select: 'name'
                    }
                });
  
            if (!cart) {
                mongoose.disconnect();
                return resolve({ total: 0, items: [] });
            }
  
            // Calculate total using stored price (which may be discounted)
            let total = 0;
            cart.items.forEach(item => {
                // Use the stored price (which might be discounted) instead of product.price
                total += item.quantity * (item.price || item.product.price);
            });
  
            mongoose.disconnect();
            resolve({ ...cart.toObject(), total });
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};
// Mettre à jour la quantité d'un produit dans le panier
const updateQuantity = (userId, productId, quantity) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                mongoose.disconnect();
                return reject("Panier introuvable");
            }

            const existingItem = cart.items.find(item => item.product.toString() === productId);
            if (!existingItem) {
                mongoose.disconnect();
                return reject("Produit introuvable dans le panier");
            }

            // Mettre à jour la quantité du produit
            existingItem.quantity = quantity;

            // Sauvegarder les modifications dans le panier
            await cart.save();
            mongoose.disconnect();
            resolve(cart);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

module.exports = {
    Cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCart,
    updateQuantity // Exportez la méthode
};
