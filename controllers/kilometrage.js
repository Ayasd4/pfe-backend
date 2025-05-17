const db = require("../db/db");

// Get all kilometrage records
exports.list = async (req, res) => {
    const sql = `
        SELECT k.*, 
            v.immatricule AS vehicule_immatricule,
            v.numparc AS vehicule_numparc,
            ch.nom AS chauffeur_nom, 
            ch.prenom AS chauffeur_prenom,
            ch.matricule_chauf AS chauffeur_matricule
        FROM acc.kilometrage k
        LEFT JOIN acc.vehicule v ON k."vehiculeId" = v.idvehicule
        LEFT JOIN acc.chauffeur ch ON k."driverId" = ch.id_chauf
        WHERE is_deleted = false
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

// Get kilometrage record by ID
exports.show = async (req, res) => {
    const valueId = Number(req.params.id);
    const sql = `
        SELECT k.*, 
            v.immatricule AS vehicule_immatricule,
            v.numparc AS vehicule_numparc,
            ch.nom AS chauffeur_nom, 
            ch.prenom AS chauffeur_prenom,
            ch.matricule_chauf AS chauffeur_matricule
        FROM acc.kilometrage k
        LEFT JOIN acc.vehicule v ON k."vehiculeId" = v.idvehicule
        LEFT JOIN acc.chauffeur ch ON k."driverId" = ch.id_chauf
        WHERE k.id = $1 AND is_deleted = false
    `;
    db.query(sql, [valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

exports.create = async (req, res) => {
    const { vehiculeId, date, driverId, calcul } = req.body;

    // Vérifie s’il existe une ligne avec ce vehiculeId
    const checkSql = `SELECT * FROM acc.kilometrage WHERE is_deleted = false AND "vehiculeId" = $1 LIMIT 1`;

    db.query(checkSql, [vehiculeId], (err, checkResult) => {
        if (err) return res.status(500).json({ error: err.message });

        if (checkResult.rows.length > 0) {
            // Une ligne existe → on la met à jour
            const existing = checkResult.rows[0];
            const oldTotal = parseInt(existing.calcul) || 0;
            const newCalcul = oldTotal + parseInt(calcul);

            const updateSql = `
                UPDATE acc.kilometrage
                SET date = $1, calcul = $2, "driverId" = $3
                WHERE "vehiculeId" = $4
                RETURNING *`;

            db.query(updateSql, [date, newCalcul, driverId, vehiculeId], (updateErr, updateResult) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                return res.status(200).json({
                    message: "Kilometrage record updated",
                    kilometrage: updateResult.rows[0],
                    oldTotal: oldTotal,
                    newTotal: newCalcul
                });
            });

        } else {
            // Aucune ligne → on insère une nouvelle
            const insertSql = `
                INSERT INTO acc.kilometrage("vehiculeId", date, "driverId", calcul)
                VALUES ($1, $2, $3, $4)
                RETURNING *`;

            db.query(insertSql, [vehiculeId, date, driverId, calcul], (insertErr, insertResult) => {
                if (insertErr) return res.status(500).json({ error: insertErr.message });

                return res.status(201).json({
                    message: "Kilometrage record created",
                    kilometrage: insertResult.rows[0],
                    oldTotal: 0,
                    newTotal: calcul
                });
            });
        }
    });
};



// Update kilometrage record
exports.update = async (req, res) => {
    const valueId = Number(req.params.id);
    const { vehiculeId, date, driverId, calcul } = req.body;
    const sql = "UPDATE acc.kilometrage SET \"vehiculeId\"=$1, date=$2, \"driverId\"=$3, calcul=$4 WHERE id=$5 RETURNING *";

    db.query(sql, [vehiculeId, date, driverId, calcul, valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kilometrage record not found" });
        }
        return res.status(200).json({ message: "Kilometrage record updated", kilometrage: result.rows[0] });
    });
};

// Delete kilometrage record
exports.delete = async (req, res) => {
    const valueId = Number(req.params.id);
    //const sql = "DELETE FROM acc.kilometrage WHERE id=$1 RETURNING id";

    const sql = "UPDATE acc.kilometrage SET is_deleted = true WHERE id = $1 RETURNING id";

    db.query(sql, [valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kilometrage record not found" });
        }
        return res.status(200).json({ message: "Kilometrage record deleted", deletedId: result.rows[0]?.id });
    });
};

// Get total kilometrage for a specific vehicle
exports.getVehicleTotal = async (req, res) => {
    const vehiculeId = Number(req.params.vehiculeId);
    const sql = "SELECT SUM(calcul) as total_km FROM acc.kilometrage WHERE \"vehiculeId\" = $1 AND is_deleted = false";

    db.query(sql, [vehiculeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({
            vehiculeId: vehiculeId,
            totalKilometrage: result.rows[0]?.total_km || 0
        });
    });
};


//
exports.getKilometrageByNumparc = async (req, res) => {
    const { numparc } = req.params;

    try {
        const sql = `
            SELECT k.calcul
            FROM acc.kilometrage k
            JOIN acc.vehicule v ON v.idvehicule = k."vehiculeId"
            WHERE v.numparc = $1 AND is_deleted = false
            LIMIT 1
        `;

        const { rows } = await db.query(sql, [numparc]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucun kilométrage trouvé pour ce véhicule." });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
