const db = require("../db/db");

exports.list = async (req, res) =>{
    const sql = "SELECT * from acc.travaux";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const id_travaux = Number(req.params.id_travaux);
    const sql = "SELECT * FROM acc.travaux WHERE id_travaux=$1";

    db.query(sql, [id_travaux], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Work not found!" });
        }

        return res.status(200).json(result.rows);
    });
}