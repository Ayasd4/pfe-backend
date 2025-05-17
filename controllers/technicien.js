const db = require("../db/db");
const moment = require("moment");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads', // Répertoire pour stocker les fichiers
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.mimetype.split('/')[1]); // Créer un nom unique pour chaque fichier
    }
});

const upload = multer({ storage: storage });

exports.list = async (req, res) => {
    const sql = "SELECT * FROM acc.technicien WHERE is_deleted = false";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err.message);
        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const id_technicien = Number(req.params.id_technicien);

    const sql = "SELECT * FROM acc.technicien where id_technicien=$1 AND is_deleted = false";
    db.query(sql, [id_technicien], (err, result) => {
        if (err) return res.status(500).json(err.message);
        return res.status(200).json(result.rows[0]);
    });
}

exports.create = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const { nom, prenom, matricule_techn, cin, telephone_techn, email_techn, specialite, date_embauche } = req.body;
        const imagePath = req.file ? req.file.filename : null;  // Enregistrer juste le nom de l'image

        // Vérification d'existence
        const checkSql = "SELECT * FROM acc.technicien WHERE matricule_techn = $1 AND is_deleted = false";
        const checkResult = await db.query(checkSql, [matricule_techn]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'This Technician already exists.' });
        }

        const sql = "INSERT INTO acc.technicien(nom, prenom, matricule_techn, cin, telephone_techn, email_techn, specialite, date_embauche, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";

        const formattedDateEmbauche = moment(date_embauche, 'YYYY-MM-DD').format("YYYY-MM-DD");

        db.query(sql, [nom, prenom, matricule_techn, cin, telephone_techn, email_techn, specialite, formattedDateEmbauche, imagePath], (err, result) => {

            if (err) return res.status(500).json(err.message);
            return res.status(200).json({ message: "Technician created successfully!", result: result.rows[0] });
        });
    });
}

exports.update = async (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_technicien = Number(req.params.id_technicien);
        const { nom, prenom, matricule_techn, cin, telephone_techn, email_techn, specialite, date_embauche } = req.body;
        const imagePath = req.file ? req.file.filename : null;  // Enregistrer juste le nom de l'image

        if (!id_technicien) {
            return res.status(200).json({ message: "Technician Id is required" });
        }

        const sql = "UPDATE acc.technicien SET nom=$1, prenom=$2, matricule_techn=$3, cin=$4, telephone_techn=$5, email_techn=$6, specialite=$7, date_embauche=$8, image=$9 WHERE id_technicien=$10 RETURNING *";

        const formattedDateEmbauche = moment(date_embauche, 'YYYY-MM-DD').format("YYYY-MM-DD");

        db.query(sql, [nom, prenom, matricule_techn, cin, telephone_techn, email_techn, specialite, formattedDateEmbauche, imagePath, id_technicien], (err, result) => {

            if (err) return res.status(500).json(err.message);

            // Vérifier si l'enregistrement existait
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Technician not found" });
            }

            return res.status(200).json({ message: "Technician updated successfully!", result: result.rows[0] });
        });
    });

}

exports.delete = async (req, res) => {
    const id_technicien = Number(req.params.id_technicien);

    if (!id_technicien) {
        return res.status(200).json({ message: "Technician Id is required" });
    }
        
    const sql = "UPDATE acc.technicien SET is_deleted = true WHERE id_technicien=$1 RETURNING id_technicien";

    db.query(sql, [id_technicien], (err, result) => {
        if (err) return res.status(500).json(err.message);

        // Vérifier si l'enregistrement existait
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Technician not found" });
        }

        return res.status(200).json({ message: "Technician deleted successfully!", result: result.rows[0] });
    });
}