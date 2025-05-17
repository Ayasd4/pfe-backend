const db = require("../db/db");

exports.getAllOrdre = async (req, res) => {
    try {
        //const sql = "SELECT travaux,material_requis, planning, date_ordre FROM acc.ordre_travail";

        const sql = `
            SELECT 
                t.nom_travail,
                o.urgence_panne,
                o.planning,
                o.date_ordre
            FROM acc.ordre_travail o
            JOIN acc.travaux t ON o.id_travaux = t.id_travaux
            WHERE is_deleted = false`;

        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Order not found!" });
            }

            return res.status(200).json(result.rows);
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getAllTechnicien = async (req, res) => {
    const sql = "SELECT matricule_techn, nom, prenom, email_techn, specialite FROM acc.technicien";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Technician not found!" });
        }

        return res.status(200).json(result.rows);
    });
}


exports.getAllAtelier = async (req, res) => {
    const sql = "SELECT  nom_atelier, telephone, email FROM acc.atelier";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Workshop not found!" });
        }

        return res.status(200).json(result.rows);
    });
}