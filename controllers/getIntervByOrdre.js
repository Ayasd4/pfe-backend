const db = require("../db/db");

exports.getIntervById = async (req, res) => {
    const id_ordre = Number(req.params.id_ordre);

    sql = `SELECT i.id_intervention,
    o.id_ordre,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.email_techn,
    tech.specialite,
    i.date_debut,
    i.heure_debut,
    i.date_fin,
    i.heure_fin,
    i.status_intervention,
    i.commentaire,
    v.numparc,
    a.nom_atelier,
    a.telephone,
    a.email
    FROM acc.intervention AS i
    JOIN acc.ordre_travail AS o ON i.id_ordre = o.id_ordre AND o.is_deleted = false
    JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux
    JOIN acc.technicien AS tech ON i.id_technicien = tech.id_technicien AND tech.is_deleted = false
    JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted = false
    JOIN acc.diagnostic AS diag ON o.id_diagnostic = diag.id_diagnostic AND diag.is_deleted = false
    JOIN acc.demandes AS d ON diag.id_demande = d.id_demande AND d.is_deleted = false
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule AND v.is_deleted = false
    WHERE o.id_ordre=$1 AND i.is_deleted = false;`;



    db.query(sql, [id_ordre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Aucune intervention trouvée pour cet ordre." });
        }

        return res.status(200).json(result.rows);
    });
}