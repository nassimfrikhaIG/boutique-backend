const mongoose=require('mongoose')
const schema_categorie = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

var Categorie=mongoose.model('categorie',schema_categorie)
var url='mongodb://localhost:27017/shop'

const postNewCategorie = (name) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                let categorie = new Categorie({ name });

                categorie.save()
                    .then((doc) => {
                        mongoose.disconnect();
                        resolve(doc);
                    })
                    .catch((err) => {
                        mongoose.disconnect();
                        reject(err);
                    });
            })
            .catch((err) => reject(err));
    });
};

// Fonction pour récupérer toutes les catégories
const getAllCategories = () => {
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Categorie.find())
        .finally(() => mongoose.disconnect());
};

// Fonction pour supprimer une catégorie
const deleteCategorie = (id) => {
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Categorie.findByIdAndDelete(id))
        .then((doc) => {
            if (!doc) throw new Error("Catégorie non trouvée");
            return { message: "Catégorie supprimée avec succès" };
        })
        .finally(() => mongoose.disconnect());
};

// Exportation des fonctions et du modèle
module.exports = {
    Categorie,
    postNewCategorie,
    getAllCategories,
    deleteCategorie
};