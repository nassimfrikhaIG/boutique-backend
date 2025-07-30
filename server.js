
// const express = require('express');
// const path = require('path');

// const produit_Route = require('./routers/produit_route');
// const user_Route = require('./routers/user_route');
// const admin_Route = require('./routers/admin_route');
// const categorie_Route = require('./routers/categorie_route');
// const Wishlist_route = require('./routers/whishlist_route');
// const offre_route = require('./routers/offre_route');
// const review_route = require('./routers/reviews_route');
// const contact_route = require('./routers/contact_route');
// const cart_route = require('./routers/cart_router');
// const chekout_route = require('./routers/chekout_route');

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Request-Methods', '*');
//   res.setHeader('Access-Control-Allow-Headers', '*');
//   res.setHeader('Access-Control-Allow-Methods', '*');
//   next();
// });

// // Servir fichiers statiques uploadés
// app.use('/uploads', express.static('uploads'));

// // Servir frontend Angular compilé
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes API avec préfixes `/api/...`
// // C’est important pour ne pas bloquer la route `/` qui doit servir Angular
// app.use('/',produit_Route)
// app.use('/',user_Route)
// // app.use('/admin',admin_Route)
// app.use('/',categorie_Route)
// app.use('/',Wishlist_route)
// app.use('/',offre_route)
// app.use('/',review_route)
// app.use('/',contact_route)
// app.use('/',cart_route)
// app.use('/',chekout_route)

// // Toutes les autres routes non reconnues => renvoyer Angular index.html
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(3000, () => {
//   console.log('Serveur démarré sur http://localhost:3000');
// });
const express = require('express');
const path = require('path');
const cors = require('cors');

// Import des routes avec gestion d'erreurs
let produit_Route, user_Route, admin_Route, categorie_Route, Wishlist_route, 
    offre_route, review_route, contact_route, cart_route, chekout_route;

try {
  produit_Route = require('./routers/produit_route');
  user_Route = require('./routers/user_route');
  admin_Route = require('./routers/admin_route');
  categorie_Route = require('./routers/categorie_route');
  Wishlist_route = require('./routers/whishlist_route');
  offre_route = require('./routers/offre_route');
  review_route = require('./routers/reviews_route');
  contact_route = require('./routers/contact_route');
  cart_route = require('./routers/cart_router');
  chekout_route = require('./routers/chekout_route');
} catch (error) {
  console.error('Erreur lors du chargement des routes:', error.message);
  process.exit(1);
}

const app = express();

// Middleware pour parser les données
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration CORS pour permettre les requêtes cross-origin
app.use(cors({
  origin: [
    'https://votre-app.netlify.app',  // Remplacez par votre URL Netlify
    'http://localhost:4200',          // Pour le développement local Angular
    'http://localhost:3000',          // Pour le développement local
    'https://localhost:4200',         // HTTPS local si nécessaire
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// Middleware pour gérer les requêtes OPTIONS (preflight)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.sendStatus(200);
});

// Headers de sécurité additionnels
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Servir les fichiers statiques uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route de test pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Backend fonctionne correctement',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

// Routes API avec préfixe /api - avec vérification
if (produit_Route && typeof produit_Route === 'function') {
  app.use('/api', produit_Route);
} else {
  console.warn('produit_Route n\'est pas un middleware valide');
}

if (user_Route && typeof user_Route === 'function') {
  app.use('/api', user_Route);
} else {
  console.warn('user_Route n\'est pas un middleware valide');
}


if (categorie_Route && typeof categorie_Route === 'function') {
  app.use('/api', categorie_Route);
} else {
  console.warn('categorie_Route n\'est pas un middleware valide');
}

if (Wishlist_route && typeof Wishlist_route === 'function') {
  app.use('/api', Wishlist_route);
} else {
  console.warn('Wishlist_route n\'est pas un middleware valide');
}

if (offre_route && typeof offre_route === 'function') {
  app.use('/api', offre_route);
} else {
  console.warn('offre_route n\'est pas un middleware valide');
}

if (review_route && typeof review_route === 'function') {
  app.use('/api', review_route);
} else {
  console.warn('review_route n\'est pas un middleware valide');
}

if (contact_route && typeof contact_route === 'function') {
  app.use('/api', contact_route);
} else {
  console.warn('contact_route n\'est pas un middleware valide');
}

if (cart_route && typeof cart_route === 'function') {
  app.use('/api', cart_route);
} else {
  console.warn('cart_route n\'est pas un middleware valide');
}

if (chekout_route && typeof chekout_route === 'function') {
  app.use('/api', chekout_route);
} else {
  console.warn('chekout_route n\'est pas un middleware valide');
}

// Middleware pour logger les requêtes (optionnel, pour debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Gestion des erreurs 404 pour les routes API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Route API non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Servir le frontend Angular (si vous en avez un dans le dossier public)
app.use(express.static(path.join(__dirname, 'public')));

// Route catch-all pour Angular (SPA routing)
app.get('*', (req, res) => {
  // Si vous avez un frontend Angular compilé
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  // Vérifier si le fichier index.html existe
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si pas de frontend, renvoyer un message d'information
    res.json({
      message: 'API Backend actif',
      status: 'success',
      availableRoutes: [
        'GET /api/health - Vérification de l\'état de l\'API',
        'Autres routes définies dans vos routers'
      ],
      note: 'Cette API est configurée pour fonctionner avec un frontend séparé'
    });
  }
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Configuration du port pour Render (important!)
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Important pour Render

app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📅 Démarrage: ${new Date().toISOString()}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 API accessible sur: http://localhost:${PORT}/api`);
    console.log(`💡 Test de santé: http://localhost:${PORT}/api/health`);
  }
});