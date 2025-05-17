const db = require("../db/db");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads', // Répertoire pour stocker les fichiers
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.mimetype.split('/')[1]); // Créer un nom unique pour chaque fichier
    }
});

const upload = multer({ storage: storage });

exports.create = async (req, res) => {
    // Utilisation de 'upload.single('image')' pour gérer l'upload du fichier image
    upload.single('image')(req, res, async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const { nom, prenom, matricule_chauf, cin, telephone, email } = req.body;
        //const imagePath = req.file ? req.file.path : null;
        const imagePath = req.file ? req.file.filename : null;  // Enregistrer juste le nom de l'image

        // Vérification d'existence
        const checkSql = "SELECT * FROM acc.chauffeur WHERE matricule_chauf = $1 AND is_deleted= false";
        const checkResult = await db.query(checkSql, [matricule_chauf]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'This Driver already exists.' });
        }

        const sql = "INSERT INTO acc.chauffeur (nom, prenom, matricule_chauf, cin, telephone, email, image) VALUES ($1, $2, $3, $4,$5,$6, $7) RETURNING *";
        db.query(sql, [nom, prenom, matricule_chauf, cin, telephone, email, imagePath], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(201).json(result.rows[0]);
        });
    });
};

exports.list = async (req, res) => {
    const sql = "SELECT * FROM acc.chauffeur WHERE is_deleted= false";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const { id_chauf } = req.params;
    const sql = "SELECT * FROM acc.chauffeur WHERE id_chauf= $1 AND is_deleted= false RETURNING *";
    db.query(sql, [id_chauf], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "compte non trouvé" });
        }
        return res.status(200).json(result.rows[0]);
    });
}

exports.update = async (req, res) => {
    // Utilisation de 'upload.single('image')' pour gérer l'upload du fichier image
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const { id_chauf } = req.params;
        const { nom, prenom, matricule_chauf, cin, telephone, email } = req.body;
        //const imagePath = req.file ? req.file.path : null;
        const imagePath = req.file ? req.file.filename : null;  // Enregistrer juste le nom de l'image

        const sql = "UPDATE acc.chauffeur SET nom = $1, prenom = $2, matricule_chauf = $3, cin = $4, telephone = $5, email = $6, image=$7 WHERE id_chauf = $8 RETURNING *";
        db.query(sql, [nom, prenom, matricule_chauf, cin, telephone, email, imagePath, id_chauf], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(201).json(result.rows[0]);
        });
    });
};

exports.delete = async (req, res) => {
    const { id_chauf } = req.params;
    const sql = "UPDATE acc.chauffeur SET is_deleted = true WHERE id_chauf = $1 RETURNING id_chauf";

    //const sql = "DELETE FROM acc.chauffeur WHERE id_chauf = $1 RETURNING *";

    db.query(sql, [id_chauf], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compte non trouvé" });
        }
        return res.status(200).json({ message: "Compte supprimé avec succès", deletedchauffeur: result.rows[0] });
    });
}