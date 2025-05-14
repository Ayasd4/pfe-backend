const db = require("../db/db");

exports.create = async (req, res) => {
    const { nom, adress } = req.body;
    const sql = "INSERT INTO acc.agence (nom, adress) VALUES ($1, $2) RETURNING *";

    db.query(sql, [nom, adress], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'ajout de l'agence" });
        }
        return res.status(201).json(result.rows[0]);
    });
};

exports.list = async (req, res) => {
    const sql = "SELECT * FROM acc.agence";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la récupération des agences" });
        }
        return res.status(200).json(result.rows);
    });
};

exports.show = async (req, res) => {
    const { id_agence } = req.params;
    const sql = "SELECT * FROM acc.agence WHERE id_agence = $1";

    db.query(sql, [id_agence], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la récupération de l'agence" });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Agence non trouvée" });
        }
        return res.status(200).json(result.rows[0]);
    });
};

exports.update = async (req, res) => {
    const { id_agence } = req.params;
    const { nom, adress } = req.body;
    const sql = "UPDATE acc.agence SET nom = $1, adress = $2 WHERE id_agence = $3 RETURNING *";

    db.query(sql, [nom, adress, id_agence], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour de l'agence" });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Agence non trouvée" });
        }
        return res.status(200).json(result.rows[0]);
    });
};

exports.delete = async (req, res) => {
    const { id_agence } = req.params;
    const sql = "DELETE FROM acc.agence WHERE id_agence = $1 RETURNING *";

    db.query(sql, [id_agence], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la suppression de l'agence" });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Agence non trouvée" });
        }
        return res.status(200).json({ message: "Agence supprimée avec succès", deletedAgence: result.rows[0] });
    });
};
