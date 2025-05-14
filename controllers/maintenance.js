const db = require("../db/db");

exports.list = async (req, res) => {
    const sql = `SELECT d.id_demande, 
    d.date_demande,
    d.type_avarie,
    d.description,
    d.date_avarie,
    d.heure_avarie,
    v.numparc,
    v.immatricule,
    v.modele,
    c.nom,
    c.prenom,
    c.matricule_chauf,
    c.cin,
    c.telephone,
    c.email,
    d.statut
    FROM acc.demandes AS d
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
    JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf;`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}