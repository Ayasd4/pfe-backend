const db = require('../db/db');

exports.getDetailsOrder = async (req, res) =>{
    //const id_ordre = Number(req.params.id_ordre);
    const id_ordre = req.params.id_ordre;

    const sql = `SELECT o.id_ordre,
    diag.description_panne,
    diag.causes_panne,
    diag.actions,
    diag.date_diagnostic,
    diag.heure_diagnostic,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    a.nom_atelier,
    a.telephone,
    a.email,
    a.capacite,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.telephone_techn,
    tech.email_techn,
    tech.specialite,
    v.numparc
    FROM acc.ordre_travail AS o
    JOIN acc.diagnostic AS diag ON o.id_diagnostic = diag.id_diagnostic AND diag.is_deleted= false
    LEFT JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux 
    JOIN acc.atelier AS a ON o.id_atelier = a.id_atelier AND a.is_deleted= false
    JOIN acc.technicien AS tech ON o.id_technicien = tech.id_technicien AND tech.is_deleted= false
    JOIN acc.demandes AS d ON diag.id_demande = d.id_demande AND d.is_deleted= false
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule AND v.is_deleted= false
    WHERE id_ordre= $1 AND o.is_deleted= false`;

    db.query(sql, [id_ordre],(err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });

}