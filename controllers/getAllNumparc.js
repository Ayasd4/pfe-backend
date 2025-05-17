const db = require("../db/db");

exports.getAllNumparc = async (req, res) => {
    const sql = "SELECT numparc FROM acc.vehicule WHERE is_deleted = false";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Aucun véhicule trouvé" });
        }

        return res.status(200).json(result.rows);
    });
}