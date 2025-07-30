
const express = require('express');
const path = require('path');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});

// Servir fichiers statiques uploadés
app.use('/uploads', express.static('uploads'));

// Servir frontend Angular compilé
app.use(express.static(path.join(__dirname, 'public')));

// Routes API avec préfixes `/api/...`
// C’est important pour ne pas bloquer la route `/` qui doit servir Angular
app.use('/api', produit_Route)
app.use('/api', user_Route)
app.use('/api', categorie_Route)
app.use('/api', Wishlist_route)
app.use('/api', offre_route)
app.use('/api', review_route)
app.use('/api', contact_route)
app.use('/api', cart_route)
app.use('/api', chekout_route)

// Toutes les autres routes non reconnues => renvoyer Angular index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
