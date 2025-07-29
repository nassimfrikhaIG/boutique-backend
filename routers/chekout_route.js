const router = require('express').Router();
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../models/chekout');

const jwt = require('jsonwebtoken');

const privateKey = 'this is my secret key';

// Middleware to verify token and extract userId
const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ msg: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, privateKey);
    req.userId = decoded.id; // Extract user ID from token
    next();
  } catch (e) {
    res.status(401).json({ msg: e.message });
  }
};

// Middleware to verify admin role
const verifyTokenAdmin = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ msg: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, privateKey);
    req.userId = decoded.id;
    
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    
    next();
  } catch (e) {
    res.status(401).json({ msg: e.message });
  }
};

// Checkout endpoint to create a new order
router.post('/checkout', verifyToken, (req, res) => {
  const { shippingDetails, paymentMethod } = req.body;
  
  createOrder(req.userId, shippingDetails, paymentMethod)
    .then(order => {
      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        order: order
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

// Get all orders for the authenticated user
router.get('/orders', verifyToken, (req, res) => {
  getUserOrders(req.userId)
    .then(orders => {
      res.status(200).json({
        success: true,
        orders: orders
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

// Get details for a specific order
router.get('/orders/:id', verifyToken, (req, res) => {
  getOrderDetails(req.params.id)
    .then(order => {
      // Verify the user has permission to view this order
      if (order.user._id.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé'
        });
      }
      
      res.status(200).json({
        success: true,
        order: order
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

// Cancel an order
router.post('/orders/:id/cancel', verifyToken, (req, res) => {
  cancelOrder(req.params.id, req.userId)
    .then(order => {
      res.status(200).json({
        success: true,
        message: 'Commande annulée avec succès',
        order: order
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

// Admin routes
router.get('/admin/orders', (req, res) => {
  getAllOrders()
    .then(orders => {
      res.status(200).json({
        success: true,
        orders: orders
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

router.patch('/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  
  updateOrderStatus(req.params.id, status)
    .then(order => {
      res.status(200).json({
        success: true,
        message: 'Statut de commande mis à jour',
        order: order
      });
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        message: err.toString()
      });
    });
});

module.exports = router;