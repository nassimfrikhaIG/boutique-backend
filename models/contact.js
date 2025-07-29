const mongoose = require('mongoose');

let schema_contact = mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});

var contacts = mongoose.model('contact', schema_contact);
var url = 'mongodb://localhost:27017/shop';

// Method to save a new contact message
exports.saveContact = (name, email, subject, message) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                let contact = new contacts({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                });
                contact.save()
                    .then((savedContact) => {
                        mongoose.disconnect();
                        resolve(savedContact);
                    })
                    .catch((err) => {
                        mongoose.disconnect();
                        reject(err);
                    });
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};

// Method to retrieve all contact messages
exports.getAllContacts = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return contacts.find();
            })
            .then((contactDocs) => {
                mongoose.disconnect();
                resolve(contactDocs);
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};
// Méthode pour supprimer un contact
exports.deleteContact = (id) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                return contacts.findByIdAndDelete(id);
            })
            .then(() => {
                mongoose.disconnect();
                resolve();
            })
            .catch((err) => {
                mongoose.disconnect();
                reject(err);
            });
    });
};
