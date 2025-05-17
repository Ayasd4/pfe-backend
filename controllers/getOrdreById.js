const db = require("../db/db");

exports.getOrdreById = async (req, res) => {
    const id_ordre = req.params.id_ordre;

    if (!id_ordre) {
        return res.status(400).json({ error: "id_ordre is required" });
    }

    /*sql = `SELECT urgence_panne,
    travaux,
    material_requis,
    planning,
    date_ordre
    FROM acc.ordre_travail
    WHERE id_ordre=$1
    `;*/

    /**sql = `SELECT o.urgence_panne,
    o.travaux,
    o.material_requis,
    o.planning,
    o.date_ordre,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.email_techn,
    tech.specialite
    FROM acc.ordre_travail AS o
    JOIN acc.technicien AS tech ON o.id_technicien = tech.id_technicien    
    WHERE id_ordre=$1
    `; */

    sql = `SELECT o.id_ordre,
    o.urgence_panne,
    o.planning,
    o.date_ordre,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.email_techn,
    tech.specialite
    FROM acc.ordre_travail AS o
    JOIN acc.technicien AS tech ON o.id_technicien = tech.id_technicien 
    WHERE id_ordre=$1 AND is_deleted = false
    `;

    db.query(sql, [id_ordre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}
