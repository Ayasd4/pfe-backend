const db = require("../db/db");

//les infos
exports.getAllDiagnostic = async (req, res) => {
    const sql = "SELECT description_panne FROM acc.diagnostic";

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

exports.getAllAtelier = async (req, res) => {
    const sql = "SELECT nom_atelier FROM acc.atelier";

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

exports.getAllTechnicien = async (req, res) => {
    const sql = "SELECT matricule_techn FROM acc.technicien";

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

exports.getAllTravaux = async (req, res) => {
    const sql = "SELECT nom_travail FROM acc.travaux";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Works not found!" });
        }

        return res.status(200).json(result.rows);
    });
}