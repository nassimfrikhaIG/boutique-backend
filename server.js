const express = require('express');

// Import des routes
const produit_Route = require('./routers/produit_route');
const user_Route = require('./routers/user_route');
const categorie_Route = require('./routers/categorie_route');
const Wishlist_route = require('./routers/whishlist_route');
const offre_route = require('./routers/offre_route');
const review_route = require('./routers/reviews_route');
const contact_route = require('./routers/contact_route');
const cart_route = require('./routers/cart_router');
const chekout_route = require('./routers/chekout_route');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes de test directs (pour debug)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API fonctionne' });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Route test OK' });
});

// Routes API avec préfixe /api
app.use('/api', produit_Route);
app.use('/api', user_Route);
app.use('/api', categorie_Route);
app.use('/api', Wishlist_route);
app.use('/api', offre_route);
app.use('/api', review_route);
app.use('/api', contact_route);
app.use('/api', cart_route);
app.use('/api', chekout_route);

// Route catch-all pour debug
app.use('*', (req, res) => {
    console.log(`Route non trouvée: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route non trouvée', 
        method: req.method, 
        url: req.originalUrl 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});