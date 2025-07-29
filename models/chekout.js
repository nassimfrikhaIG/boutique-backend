const mongoose = require('mongoose');
const { Produit } = require('../models/produits');
const { users } = require('../models/user');
const { Cart } = require('../models/cart');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Prix au moment de la commande
    }],
    totalAmount: { type: Number, required: true },
    shippingDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        orderNote: { type: String }
    },
    paymentMethod: { type: String, required: true, enum: ['cash-on-delivery', 'direct-bank-transfer', 'pay-with-card', 'cash', 'paypal'] },
    status: { type: String, default: 'en attente', enum: ['en attente', 'En traitement', 'Expédiée', 'Livrée', 'annulé'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
const url = 'mongodb://localhost:27017/shop';

// Créer une nouvelle commande à partir du panier
const createOrder = (userId, shippingDetails, paymentMethod) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            // Récupérer le panier de l'utilisateur
            const cart = await Cart.findOne({ user: userId }).populate('items.product');
            
            if (!cart || cart.items.length === 0) {
                mongoose.disconnect();
                return reject("Panier vide ou inexistant");
            }

            // Préparer les éléments de commande
            const orderItems = cart.items.map(item => {
                return {
                    product: item.product._id,
                    quantity: item.quantity,
                    // price: item.product.price
                    price: item.price || item.product.price // Use the discounted price if available

                };
            });

            // Calculer le montant total
            // const totalAmount = cart.items.reduce((total, item) => {
            //     return total + (item.quantity * item.product.price);
            // }, 0);
// Fixed code
const totalAmount = cart.items.reduce((total, item) => {
    const priceToUse = item.price || item.product.price;
    return total + (item.quantity * priceToUse);
}, 0);
            // Créer la commande
            const order = new Order({
                user: userId,
                items: orderItems,
                totalAmount,
                shippingDetails,
                paymentMethod,
                status: 'en attente'
            });

            // Sauvegarder la commande
            const savedOrder = await order.save();

            // Mise à jour du stock des produits
            for (const item of cart.items) {
                await Produit.findByIdAndUpdate(
                    item.product._id,
                    { 
                        $inc: { stock: -item.quantity },
                        $set: { available: item.product.stock - item.quantity > 0 ? "En stock" : "Rupture de stock" }
                    }
                );
            }

            // Vider le panier après la commande
            await Cart.deleteOne({ user: userId });

            mongoose.disconnect();
            resolve(savedOrder);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Récupérer toutes les commandes d'un utilisateur
const getUserOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            const orders = await Order.find({ user: userId })
                .populate({
                    path: 'items.product',
                    select: 'name price image category',
                    populate: {
                        path: 'category',
                        select: 'name'
                    }
                })
                .select('items totalAmount status createdAt updatedAt shippingDetails paymentMethod') // Ajout explicite du champ status
                .sort({ createdAt: -1 });

            mongoose.disconnect();
            resolve(orders);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Récupérer les détails d'une commande spécifique
const getOrderDetails = (orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            const order = await Order.findById(orderId)
                .populate({
                    path: 'items.product',
                    select: 'name price image category',
                    populate: {
                        path: 'category',
                        select: 'name'
                    }
                })
                .populate('user', 'username email');

            if (!order) {
                mongoose.disconnect();
                return reject("Commande introuvable");
            }

            mongoose.disconnect();
            resolve(order);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Mettre à jour le statut d'une commande (pour l'administrateur)
const updateOrderStatus = (orderId, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            const order = await Order.findByIdAndUpdate(
                orderId,
                { 
                    status: status,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            if (!order) {
                mongoose.disconnect();
                return reject("Commande introuvable");
            }

            mongoose.disconnect();
            resolve(order);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Annuler une commande (et restituer les stocks)
const cancelOrder = (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            // Vérifier que la commande appartient bien à l'utilisateur
            const order = await Order.findOne({ _id: orderId, user: userId });
            
            if (!order) {
                mongoose.disconnect();
                return reject("Commande introuvable ou non autorisée");
            }

            // Vérifier que la commande peut être annulée (statut pending ou processing)
            if (order.status !== 'pending' && order.status !== 'processing') {
                mongoose.disconnect();
                return reject("Cette commande ne peut plus être annulée");
            }

            // Restituer les stocks
            for (const item of order.items) {
                await Produit.findByIdAndUpdate(
                    item.product,
                    { 
                        $inc: { stock: item.quantity },
                        $set: { available: "En stock" }
                    }
                );
            }

            // Mettre à jour le statut de la commande
            order.status = 'annulé';
            order.updatedAt = Date.now();
            await order.save();

            mongoose.disconnect();
            resolve(order);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};

// Récupérer toutes les commandes (pour l'administrateur)
// const getAllOrders = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//             const orders = await Order.find()
//                 .populate('user', 'username email')
//                 .sort({ createdAt: -1 });

//             mongoose.disconnect();
//             resolve(orders);
//         } catch (err) {
//             mongoose.disconnect();
//             reject(err);
//         }
//     });
// };
// Récupérer toutes les commandes (pour l'administrateur)
const getAllOrders = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            const orders = await Order.find()
                .populate('user', 'username email')
                .populate({
                    path: 'items.product',
                    select: 'name price image category'
                })
                .sort({ createdAt: -1 });

            mongoose.disconnect();
            resolve(orders);
        } catch (err) {
            mongoose.disconnect();
            reject(err);
        }
    });
};
module.exports = {
  Order,
    createOrder,
    getUserOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
};

