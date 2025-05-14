const db = require("../db/db");
const moment = require('moment');


exports.search = async (req, res) => {
    try {

        let conditions = [];
        let values = [];
        let paramIndex = 1;

        if (req.query.id_demande) {
            conditions.push(`d.id_demande = $${paramIndex}`);
            values.push(req.query.id_demande);
            paramIndex++;
        }

        if (req.query.id_vehicule) {
            conditions.push(`d.id_vehicule = $${paramIndex}`);
            values.push(req.query.id_vehicule);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }

        if (req.query.date_demande) {
            conditions.push(`d.date_demande::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_demande}%`);
            paramIndex++;
        }

        if (req.query.type_avarie) {
            conditions.push(`d.type_avarie ILIKE $${paramIndex}`);
            values.push(`%${req.query.type_avarie}%`);
            paramIndex++;
        }

        if (req.query.description) {
            conditions.push(`d.description::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.description}%`);
            paramIndex++;
        }

        //diag
        if (req.query.description_panne) {
            conditions.push(`diag.description_panne::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.description_panne}%`);
            paramIndex++;
        }

        if (req.query.causes_panne) {
            conditions.push(`diag.causes_panne ILIKE $${paramIndex}`);
            values.push(`%${req.query.causes_panne}%`);
            paramIndex++;
        }

        if (req.query.actions) {
            conditions.push(`diag.actions::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.actions}%`);
            paramIndex++;
        }

        if (req.query.date_diagnostic) {
            conditions.push(`diag.date_diagnostic::DATE = $${paramIndex}`);
            values.push(`%${req.query.date_diagnostic}%`);
            paramIndex++;
        }

        if (req.query.heure_diagnostic) {
            conditions.push(`diag.heure_diagnostic::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.heure_diagnostic}%`);
            paramIndex++;
        }

        let sql = `SELECT diag.id_diagnostic,
        d.id_demande,
        d.date_demande,
        d.type_avarie,
        d.description,
        v.numparc,
        diag.description_panne,
        diag.causes_panne,
        diag.actions,
        diag.actions,
        diag.date_diagnostic,
        diag.heure_diagnostic
        FROM acc.diagnostic AS diag
        JOIN acc.demandes AS d ON diag.id_demande = d.id_demande
        JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule`;

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        db.query(sql, values, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(200).json(result.rows);
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


exports.list = async (req, res) => {
    sql = `SELECT diag.id_diagnostic,
    d.id_demande,
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
    diag.description_panne,
    diag.causes_panne,
    diag.actions,
    diag.date_diagnostic,
    diag.heure_diagnostic
    FROM acc.diagnostic AS diag
    JOIN acc.demandes AS d ON diag.id_demande = d.id_demande
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
    JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf;`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const id_diagnostic = Number(req.params.id_diagnostic);

    sql = "SELECT * FROM acc.diagnostic WHERE id_diagnostic=$1";

    db.query(sql, [id_diagnostic], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json(result.rows);
    });
}

exports.create = async (req, res) => {
    const { id_demande, description_panne, causes_panne, actions, date_diagnostic, heure_diagnostic } = req.body;

    if (!id_demande) {
        return res.status(400).json({ error: "Missing Request (id_demande is required)" });
    }

    // Vérifier si la demande existe dans la table demandes
    const demandeResult = await db.query("SELECT id_demande FROM acc.demandes WHERE id_demande= $1", [id_demande]);
    if (demandeResult.rows.length === 0) {
        return res.status(400).json({ error: "Request not found (id_demande does not exist)!" });
    }
    //const id_demande = demandeResult.rows[0].id_demande;

    const formattedDateDiagnostic = moment(date_diagnostic, 'YYYY-MM-DD').format("YYYY-MM-DD");
    const formattedHeureDiagnostic = moment(heure_diagnostic, 'HH:mm').format("HH:mm");

    sql = `INSERT INTO acc.diagnostic(id_demande, description_panne, causes_panne, actions, date_diagnostic, heure_diagnostic) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id_diagnostic, id_demande, description_panne, causes_panne, actions, date_diagnostic, heure_diagnostic`;

    db.query(sql, [id_demande, description_panne, causes_panne, actions, formattedDateDiagnostic, formattedHeureDiagnostic], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "diagnostic created successfully!", result: result.rows[0] });
    });
}

exports.update = async (req, res) => {

    const id_diagnostic = Number(req.params.id_diagnostic);
    const { id_demande, description_panne, causes_panne, actions, date_diagnostic, heure_diagnostic } = req.body;

    if (!id_demande) {
        return res.status(400).json({ error: "Missing Request (id_demande is required)" });
    }

    // Vérifier si la demande existe dans la table demandes
    const demandeResult = await db.query("SELECT id_demande FROM acc.demandes WHERE id_demande= $1", [id_demande]);
    if (demandeResult.rows.length === 0) {
        return res.status(400).json({ error: "Request not found (id_demande does not exist)!" });
    }
    //const id_demande = demandeResult.rows[0].id_demande;

    const formattedDateDiagnostic = moment(date_diagnostic, 'YYYY-MM-DD').format("YYYY-MM-DD");
    const formattedHeureDiagnostic = moment(heure_diagnostic, 'HH:mm').format("HH:mm");

    sql = `UPDATE acc.diagnostic 
    SET id_demande=$1, description_panne=$2, causes_panne=$3, actions=$4, date_diagnostic=$5, heure_diagnostic=$6
    WHERE id_diagnostic=$7
    RETURNING *`;

    db.query(sql, [id_demande, description_panne, causes_panne, actions, formattedDateDiagnostic, formattedHeureDiagnostic, id_diagnostic], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "diagnostic updated successfully!", result: result.rows[0] });
    });
}


exports.delete = async (req, res) => {
    const id_diagnostic = Number(req.params.id_diagnostic);

    sql = "DELETE FROM acc.diagnostic WHERE id_diagnostic=$1";

    db.query(sql, [id_diagnostic], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "Diagnostic deleted successfully!", result: result.rows[0] });
    });
}
