const db = require("../db/db");

exports.getAllName = async (req, res) => {
    const sql = "SELECT nom FROM acc.chauffeur WHERE is_deleted = false";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Aucun chauffeur trouvé" });
        }

        return res.status(200).json(result.rows);
    });
}