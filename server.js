const express = require('express');
const path = require('path');
const cors = require('cors');

const produit_Route = require('./routers/produit_route');
const user_Route = require('./routers/user_route');
const admin_Route = require('./routers/admin_route');
const categorie_Route = require('./routers/categorie_route');
const Wishlist_route = require('./routers/whishlist_route');
const offre_route = require('./routers/offre_route');
const review_route = require('./routers/reviews_route');
const contact_route = require('./routers/contact_route');
const cart_route = require('./routers/cart_router');
const chekout_route = require('./routers/chekout_route');

const app = express();

// CORS (Netlify uniquement)
app.use(cors({
  origin: 'https://cozy-queijadas-1ed97a.netlify.app',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques uploadés
app.use('/uploads', express.static('uploads'));

// Fichiers Angular compilés
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api', produit_Route);
app.use('/api', user_Route);
app.use('/api', categorie_Route);
app.use('/api', Wishlist_route);
app.use('/api', offre_route);
app.use('/api', review_route);
app.use('/api', contact_route);
app.use('/api', cart_route);
app.use('/api', chekout_route);

// Route Angular catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port dynamique pour Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
