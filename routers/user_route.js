const express = require('express');
const route = express.Router();
const user_model = require('../models/user');

// ===========================
// Route: Enregistrement Client
// ===========================
route.post('/registre', (req, res) => {
    const userData = {
        ...req.body,
        role: 'CLIENT'
    };
    user_model.registre(userData)
        .then((user) => res.status(200).json({ user, msg: "Client enregistré" }))
        .catch((err) => res.status(400).json({ Error: err }));
});

// ===========================
// Route: Enregistrement Admin
// ===========================
route.post('/registre/admin', (req, res) => {
    const adminData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: 'ADMIN'
    };

    user_model.registre(adminData)
        .then((user) => res.status(200).json({ user, msg: "Admin enregistré" }))
        .catch((err) => res.status(400).json({ Error: err }));
});

// ===========================
// Route: Connexion (Client ou Admin)
// ===========================
route.post('/login', (req, res) => {
    user_model.login(req.body.email, req.body.password)
    .then((result) => {
        console.log('Résultat login:', result);
        res.status(200).json(result);
    })
            .catch((err) => res.status(400).json({ Error: err }));
});

// ===========================
// Route: Obtenir tous les utilisateurs
// ===========================
route.get('/user', (req, res, next) => {
    user_model.GetAllUser()
        .then((doc) => res.send(doc))
        .catch((err) => res.status(400).json(err));
});

// ===========================
// Route: Mettre à jour un utilisateur par ID
// ===========================
route.patch('/user/:id', (req, res, next) => {
    const userData = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        address: req.body.address,
        country: req.body.country,
        city: req.body.city,
        region: req.body.region,
        postalCode: req.body.postalCode
    };

    user_model.updateuser(req.params.id, userData)
        .then((doc) => res.status(200).json(doc))
        .catch((err) => res.status(400).json(err));
});

// ===========================
// Route: Mettre à jour le mot de passe d'un utilisateur
// ===========================
route.patch('/user/:id/password', (req, res, next) => {
    user_model.updatePassword(req.params.id, req.body.password)
        .then((doc) => res.status(200).json({ msg: "Password updated successfully" }))
        .catch((err) => res.status(400).json(err));
});

// ===========================
// Route: Obtenir un utilisateur par ID
// ===========================
route.get('/user/:id', (req, res, next) => {
    user_model.getUserById(req.params.id)
        .then((user) => res.status(200).json(user))
        .catch((err) => res.status(400).json({ Error: err }));
});
route.post('/forgot-password', (req, res) => {
    user_model.forgotPassword(req.body.email)
        .then(message => {
            console.log('Email envoyé avec succès:', req.body.email);
            res.status(200).json({ success: true, message });
        })
        .catch(error => {
            console.log('Erreur lors de l\'envoi de l\'email:', error);
            res.status(400).json({ success: false, error });
        });
});

// Route pour vérifier si un token est valide
route.get('/reset-password/:token', (req, res) => {
    user_model.checkResetToken(req.params.token)
        .then(user => {
            console.log('Token valide pour:', user.email);
            res.status(200).json({ success: true, email: user.email });
        })
        .catch(error => {
            console.log('Token invalide:', req.params.token);
            res.status(400).json({ success: false, error });
        });
});

// Route pour réinitialiser le mot de passe avec un token
route.post('/reset-password/:token', (req, res) => {
    user_model.resetPassword(req.params.token, req.body.password)
        .then(message => {
            console.log('Mot de passe réinitialisé avec succès');
            res.status(200).json({ success: true, message });
        })
        .catch(error => {
            console.log('Erreur lors de la réinitialisation du mot de passe:', error);
            res.status(400).json({ success: false, error });
        });
});
module.exports = route;