const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS au lieu de SSL
    auth: {
      user: 'nassimfrikha123@gmail.com',
      pass: 'hfzxtwqjnlvmmfjj' // Utilisez un "mot de passe d'application" pour Gmail
    },
    tls: {
      rejectUnauthorized: false // En développement seulement, à retirer en production
    }
  });
let schema_user = mongoose.Schema({
    username: String,
    email: { type: String, required: true, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    country: String,
    city: String,
    region: String,
    postalCode: String,
    role: { type: String, enum: ['ADMIN', 'CLIENT'], default: 'CLIENT' },
    resetPasswordToken: String,
    resetPasswordExpires: Date
   
})

var users = mongoose.model('user', schema_user)
var url = 'mongodb://localhost:27017/shop'

const privatekey = 'this is my secret key'

const userModel = {
    model: users,
    schema: schema_user,

    registre: (userData) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.findOne({ email: userData.email })
            }).then((doc) => {
                if (doc) {
                    mongoose.disconnect()
                    reject('This email already exists')
                } else {
                    bcrypt.hash(userData.password, 10).then((hashedpassword) => {
                        let user = new users({
                            username: userData.username,
                            email: userData.email,
                            password: hashedpassword,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            phone: userData.phone,
                            address: userData.address,
                            country: userData.country,
                            city: userData.city,
                            region: userData.region,
                            postalCode: userData.postalCode,
                            role: userData.role || 'CLIENT' // 👈 Soit 'USER' (par défaut) ou 'ADMIN'
                        })
                        user.save().then((user) => {
                            mongoose.disconnect()
                            resolve(user)
                        }).catch((err) => {
                            mongoose.disconnect()
                            reject(err)
                        })
                    })
                }
            })
        })
    },

    login: (email, password) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.findOne({ email: email })
            }).then((user) => {
                if (!user) {
                    mongoose.disconnect()
                    reject('This email does not exist')
                } else {
                    bcrypt.compare(password, user.password).then((same) => {
                        if (same) {
                            let token = jwt.sign({
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                role: user.role // 👈 Inclure le rôle dans le token
                            }, privatekey, {
                                expiresIn: '1d',
                            })
                            mongoose.disconnect()
                            resolve({ token, role: user.role, username: user.username })
                        } else {
                            mongoose.disconnect()
                            reject('Invalid password')
                        }
                    })
                }
            })
        })
    },
    GetAllUser: () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.find()
            }).then((doc) => {
                mongoose.disconnect()
                resolve(doc)
            }).catch((err) => {
                mongoose.disconnect()
                reject(err)
            })
        })
    },

    // Updated updateuser function to include all fields
    updateuser: (id, userData) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.updateOne({ _id: id }, {
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    address: userData.address,
                    country: userData.country,
                    city: userData.city,
                    region: userData.region,
                    postalCode: userData.postalCode
                    // Note: password is not updated here to maintain security
                })
            }).then((doc) => {
                mongoose.disconnect()
                resolve(doc)
            }).catch((err) => {
                mongoose.disconnect()
                reject(err)
            })
        })
    },

    // Update password separately with proper hashing
    updatePassword: (id, newPassword) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return bcrypt.hash(newPassword, 10)
            }).then((hashedPassword) => {
                return users.updateOne({ _id: id }, { password: hashedPassword })
            }).then((doc) => {
                mongoose.disconnect()
                resolve(doc)
            }).catch((err) => {
                mongoose.disconnect()
                reject(err)
            })
        })
    },

    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.findOne({ _id: id })
            }).then((user) => {
                mongoose.disconnect()
                if (user) {
                    resolve(user)
                } else {
                    reject('User not found')
                }
            }).catch((err) => {
                mongoose.disconnect()
                reject(err)
            })
        })
    },
 forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
            return users.findOne({ email: email });
        }).then((user) => {
            if (!user) {
                mongoose.disconnect();
                reject('Aucun compte associé à cet email');
            } else {
                // Générer un token unique avec une date d'expiration
                const token = crypto.randomBytes(20).toString('hex');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 heure de validité
                
                return user.save();
            }
        }).then((user) => {
            // Création du mail avec le lien de réinitialisation
            const resetUrl = `http://localhost:4200/reset-password/${user.resetPasswordToken}`;
            
            const mailOptions = {
                to: user.email,
                from: 'nassimfrikha123@gmail.com',
                subject: 'Réinitialisation de votre mot de passe',
                html: `
                <p>Bonjour ${user.username || user.firstName || ''},</p>
                <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur ce lien pour générer votre nouveau mot de passe:</p>
                <p style="margin: 20px 0;">
                    <a 
                        href="${resetUrl}" 
                        style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;"
                        target="_self"
                        rel="noopener noreferrer"
                    >
                        Réinitialiser mon mot de passe
                    </a>
                </p>
                <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur:</p>
                <p>${resetUrl}</p>
                <p>Ce lien expirera dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                <p>Cordialement,<br>L'équipe de support</p>
                `
            };
            
            // Envoi de l'email
            transporter.sendMail(mailOptions, (err) => {
                mongoose.disconnect();
                if (err) {
                    reject('Erreur lors de l\'envoi de l\'email: ' + err);
                } else {
                    resolve('Un email de réinitialisation a été envoyé à ' + user.email);
                }
            });
        }).catch((err) => {
            mongoose.disconnect();
            reject(err);
        });
    });
},

    // 2. Méthode pour vérifier la validité du token
    checkResetToken: (token) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() }
                });
            }).then((user) => {
                mongoose.disconnect();
                if (!user) {
                    reject('Le token est invalide ou a expiré');
                } else {
                    resolve(user);
                }
            }).catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
        });
    },

    // 3. Méthode pour réinitialiser le mot de passe avec un token valide
    resetPassword: (token, newPassword) => {
        return new Promise((resolve, reject) => {
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                return users.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() }
                });
            }).then((user) => {
                if (!user) {
                    mongoose.disconnect();
                    reject('Le token est invalide ou a expiré');
                } else {
                    // Hachage du nouveau mot de passe
                    return bcrypt.hash(newPassword, 10).then((hashedPassword) => {
                        user.password = hashedPassword;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        return user.save();
                    });
                }
            }).then((user) => {
                mongoose.disconnect();
                
                // Envoyer un email de confirmation (optionnel)
                const mailOptions = {
                    to: user.email,
                    from: 'nassimfrikha123@gmail.com',
                    subject: 'Confirmation de changement de mot de passe',
                    html: `
                    <p>Bonjour ${user.username || user.firstName || ''},</p>
                    <p>Votre mot de passe a été changé avec succès.</p>
                    <p>Si vous n'êtes pas à l'origine de ce changement, veuillez contacter notre support immédiatement.</p>
                    <p>Cordialement,<br>L'équipe de support</p>
                    `
                };
                
                transporter.sendMail(mailOptions);
                resolve('Votre mot de passe a été mis à jour avec succès');
            }).catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
        });
    }
    
}


module.exports = userModel

//hfzxtwqjnlvmmfjj