const db = require("../db/db");
const moment = require("moment");
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePdf = async (req, res) => {
    try {
        const id_intervention = Number(req.params.id_intervention);

        console.log('ID Intervention received:', id_intervention);

        const sql = `SELECT i.id_intervention,
    o.id_ordre,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    o.status,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.email_techn,
    tech.telephone_techn,
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
    LEFT JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux
    JOIN acc.technicien AS tech ON i.id_technicien = tech.id_technicien AND tech.is_deleted = false
    JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted = false
    JOIN acc.diagnostic AS diag ON o.id_diagnostic = diag.id_diagnostic AND diag.is_deleted = false
    JOIN acc.demandes AS d ON diag.id_demande = d.id_demande AND d.is_deleted = false
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule AND v.is_deleted = false
    WHERE id_intervention = $1 AND i.is_deleted = false`;


        db.query(sql, [id_intervention], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Intervention Not Found!' });
            }

            const intervention = result.rows[0];


            // Création du PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

            doc.pipe(res); // envoyer directement dans la réponse


            const logoPath = 'assets/srtj.png'; // chemin relatif vers ton logo
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 30, { width: 70 }); // x = 50, y = 30, largeur = 80
                doc.moveDown(); // petit espace après le logo

                doc.fontSize(14).font('Helvetica-Bold').text('S.R.T JENDOUBA', 420, 50, { align: 'left' });
                doc.fontSize(12).font('Helvetica').text('Division Technique', 420, 70, { align: 'left' });
                doc.font('Helvetica').text('Service Maintenance', 420, 85, { align: 'left' });

            }
            doc.x = 50;

            //doc.moveTo(50, 100).lineTo(550, 100).stroke();
            doc.moveDown(3);
            //doc.y = 120;
            doc.fontSize(25)
                .font('Helvetica')
                .text(`Rapport d'Intervention Technique sur l'Ordre de Travail N° ${intervention.id_ordre} `, {
                    align: 'center',
                    underline: true,
                });

            doc.moveDown(1);

            doc.fontSize(14).font('Helvetica').text('jour:......................................................................................................................');   // côté droit

            doc.moveDown(1);

            // Informations de la demande
            doc.fontSize(15).font('Helvetica-Bold').text('Informatin sur l\'ordre de travail:', 50, doc.y, { underline: true });
            doc.font('Helvetica').text(`Travail à faire: ${intervention.nom_travail} `);
            doc.font('Helvetica').text(`Plannification de L'intervention: ${intervention.planning}`);
            doc.font('Helvetica').text(`Date de création: ${intervention.date_ordre?.toLocaleDateString?.() || intervention.date_ordre}`);

            doc.moveDown(1);

            //technicien
            doc.fontSize(15).font('Helvetica-Bold').text('Technicien Concerné :', { underline: true });
            doc.font('Helvetica').text(`Numéro de technicien: ${intervention.matricule_techn}`);
            doc.font('Helvetica').text(`Nom: ${intervention.nom} ${intervention.prenom}`);
            doc.font('Helvetica').text(`E-mail: ${intervention.email_techn}`);
            doc.font('Helvetica').text(`Téléphone: ${intervention.telephone_techn}`);
            doc.font('Helvetica').text(`Specialité: ${intervention.specialite}`);

            //doc.fontSize(14).font('Helvetica').text('----------------------------------------------------------------------------------------------------');

            doc.moveDown(1);

            // Informations sur l'interv.
            doc.fontSize(14).font('Helvetica');
            doc.font('Helvetica-Bold').text(`L'intervention N° ${intervention.id_intervention}`, { underline: true });
            doc.font('Helvetica').text(`Date de début de l'intervention: ${intervention.date_debut?.toLocaleDateString?.() || intervention.date_debut}`);
            doc.font('Helvetica').text(`Heure de début de l'intervention: ${intervention.heure_debut}`);
            doc.font('Helvetica').text(`Date de Fin de l'intervention: ${intervention.date_fin?.toLocaleDateString?.() || intervention.date_fin}`);
            doc.font('Helvetica').text(`Heure de Fin de l'intervention: ${intervention.heure_fin}`);
            doc.font('Helvetica').text(`L'intervention: ${intervention.status_intervention}`);
            doc.font('Helvetica').text(`Commentaire: ${intervention.commentaire}`);

            doc.moveDown(3); // saut de 2 lignes

            const y = doc.y + 20; // position verticale actuelle + un petit espace

            doc.fontSize(12);
            doc.text('Signature Chef d\'atelier', 50, y); // côté gauche
            doc.text('Signature responsable maintenance', 400, y);   // côté droit

            doc.end();

        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.search = async (req, res) => {
    try {

        let conditions = [];
        let values = [];
        let paramIndex = 1;

        if (req.query.id_ordre) {
            conditions.push(`o.id_ordre = $${paramIndex}`);
            values.push(req.query.id_ordre);
            paramIndex++;
        }

        if (req.query.id_technicien) {
            conditions.push(`tech.id_technicien = $${paramIndex}`);
            values.push(req.query.id_technicien);
            paramIndex++;
        }

        //technicien
        if (req.query.matricule_techn) {
            conditions.push(`(tech.matricule_techn || ' ' || tech.nom || ' ' || tech.prenom) ILIKE $${paramIndex}`);
            values.push(`%${req.query.matricule_techn}%`);
            paramIndex++;
        }

        //ordre
        if (req.query.urgence_panne) {
            conditions.push(`o.urgence_panne ILIKE $${paramIndex}`);
            values.push(`%${req.query.urgence_panne}%`);
            paramIndex++;
        }

        if (req.query.planning) {
            conditions.push(`o.planning ILIKE $${paramIndex}`);
            values.push(`%${req.query.planning}%`);
            paramIndex++;
        }

        if (req.query.date_ordre) {
            conditions.push(`o.date_ordre::DATE = $${paramIndex}`);
            values.push(`%${req.query.date_ordre}%`);
            paramIndex++;
        }

        if (req.query.status) {
            conditions.push(`o.status ILIKE $${paramIndex}`);
            values.push(`%${req.query.status}%`);
            paramIndex++;
        }

        //intervention
        if (req.query.date_debut) {
            conditions.push(`i.date_debut::TEXT ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_debut}%`);
            paramIndex++;
        }

        if (req.query.heure_debut) {
            conditions.push(`i.heure_debut::TEXT ILIKE $${paramIndex}`);
            values.push(`%${req.query.heure_debut}%`);
            paramIndex++;
        }

        if (req.query.date_fin) {
            conditions.push(`i.date_fin::TEXT ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_fin}%`);
            paramIndex++;
        }

        if (req.query.heure_fin) {
            conditions.push(`i.heure_fin::TEXT ILIKE $${paramIndex}`);
            values.push(`%${req.query.heure_fin}%`);
            paramIndex++;
        }

        if (req.query.status_intervention) {
            conditions.push(`i.status_intervention ILIKE $${paramIndex}`);
            values.push(`%${req.query.status_intervention}%`);
            paramIndex++;
        }

        let sql = `SELECT i.id_intervention,
    o.urgence_panne,
    o.planning,
    o.date_ordre,
    o.status,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
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
    WHERE i.is_deleted = false
    `;

        if (conditions.length > 0) {
            sql += " AND " + conditions.join(" AND ");
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
    WHERE i.is_deleted = false;`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const id_intervention = Number(req.params.id_intervention);
    const sql = "SELECT * FROM acc.intervention WHERE id_intervention=$1 AND is_deleted = false";

    db.query(sql, [id_intervention], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Intervention not found!" });
        }

        return res.status(200).json(result.rows);
    });
}

exports.create = async (req, res) => {
    try {
        const { ordre, technicien, date_debut, heure_debut, date_fin, heure_fin, status_intervention, commentaire, atelier } = req.body;

        // Vérification que les données sont présentes
        if (!ordre || !technicien || !atelier) {
            return res.status(400).json({ error: "Missing order, workshop or technician" });
        }

        const { nom_travail } = ordre;
        const { matricule_techn } = technicien;
        const { nom_atelier } = atelier;

        const ordreResult = await db.query(`SELECT o.id_ordre, t.nom_travail FROM acc.ordre_travail AS o
            JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux WHERE nom_travail = $1 AND o.is_deleted= false`, [nom_travail]);
        if (ordreResult.rows.length === 0) {
            return res.status(400).json({ error: "order not found!" });
        }
        const id_ordre = ordreResult.rows[0].id_ordre;

        const technicienResult = await db.query("SELECT id_technicien FROM acc.technicien WHERE matricule_techn = $1 AND is_deleted = false", [matricule_techn]);
        if (technicienResult.rows.length === 0) {
            return res.status(400).json({ error: "technicien not found!" });
        }
        const id_technicien = technicienResult.rows[0].id_technicien;

        const atelierResult = await db.query("SELECT id_atelier FROM acc.atelier WHERE nom_atelier = $1 AND is_deleted = false", [nom_atelier]);
        if (atelierResult.rows.length === 0) {
            return res.status(400).json({ error: "workshops not found!" });
        }
        const id_atelier = atelierResult.rows[0].id_atelier;


        const formattedDateDebut = moment(date_debut, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedHeureDebut = moment(heure_debut, 'HH:mm').format("HH:mm");
        const formattedDateFin = moment(date_fin, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedHeureFin = moment(heure_fin, 'HH:mm').format("HH:mm");


        const sql = `INSERT INTO acc.intervention(id_ordre, id_technicien, date_debut, heure_debut, date_fin, heure_fin, status_intervention, commentaire, id_atelier)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_ordre, id_technicien, date_debut, heure_debut, date_fin, heure_fin, status_intervention, commentaire, id_atelier`;

        db.query(sql, [id_ordre, id_technicien, formattedDateDebut, formattedHeureDebut, formattedDateFin, formattedHeureFin, status_intervention, commentaire, id_atelier], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Intervention not found!" });
            }

            return res.status(200).json({ message: "Intervention added successfully!", Intervention: result.rows });
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })

    }
}

exports.update = async (req, res) => {
    try {
        const id_intervention = Number(req.params.id_intervention);
        const { ordre, technicien, date_debut, heure_debut, date_fin, heure_fin, status_intervention, commentaire, atelier } = req.body;

        // Vérification que les données sont présentes
        if (!ordre || !technicien) {
            return res.status(400).json({ error: "Missing order or technician" });
        }

        const { nom_travail } = ordre;
        const { matricule_techn } = technicien;
        const { nom_atelier } = atelier;

        const ordreResult = await db.query(`SELECT o.id_ordre,t.nom_travail FROM acc.ordre_travail AS o
            JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux WHERE nom_travail = $1 AND is_deleted = false`, [nom_travail]);
        if (ordreResult.rows.length === 0) {
            return res.status(400).json({ error: "order not found!" });
        }
        const id_ordre = ordreResult.rows[0].id_ordre;


        const technicienResult = await db.query("SELECT id_technicien FROM acc.technicien WHERE matricule_techn = $1 AND is_deleted = false", [matricule_techn]);
        if (technicienResult.rows.length === 0) {
            return res.status(400).json({ error: "technicien not found!" });
        }
        const id_technicien = technicienResult.rows[0].id_technicien;

        const atelierResult = await db.query("SELECT id_atelier FROM acc.atelier WHERE nom_atelier = $1 AND is_deleted = false", [nom_atelier]);
        if (atelierResult.rows.length === 0) {
            return res.status(400).json({ error: "workshops not found!" });
        }
        const id_atelier = atelierResult.rows[0].id_atelier;


        const formattedDateDebut = moment(date_debut, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedHeureDebut = moment(heure_debut, 'HH:mm').format("HH:mm");
        const formattedDateFin = moment(date_fin, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedHeureFin = moment(heure_fin, 'HH:mm').format("HH:mm");


        const sql = `UPDATE acc.intervention SET id_ordre = $1, id_technicien = $2, date_debut = $3, heure_debut = $4, date_fin = $5, heure_fin = $6, status_intervention = $7, commentaire = $8, id_atelier=$9
        WHERE id_intervention = $10 RETURNING * `;

        db.query(sql, [id_ordre, id_technicien, formattedDateDebut, formattedHeureDebut, formattedDateFin, formattedHeureFin, status_intervention, commentaire, id_atelier, id_intervention], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Intervention not found!" });
            }

            return res.status(200).json({ message: "Intervention updated successfully!", Intervention: result.rows });
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })

    }
}


exports.delete = async (req, res) => {
    const id_intervention = Number(req.params.id_intervention);
    //const sql = "DELETE FROM acc.intervention WHERE id_intervention=$1 RETURNING *";

    const sql = "UPDATE acc.intervention SET is_deleted = true WHERE id_intervention=$1 RETURNING id_intervention";

    db.query(sql, [id_intervention], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Intervention not found!" });
        }

        return res.status(200).json({ message: "Intervention deleted successfully", intervention: result.rows });
    });
}

exports.getOrdreByTravaux = async (req, res) => {
    const nom_travail = req.params.nom_travail;

    const sql = `
        SELECT 
            t.nom_travail,
            o.urgence_panne,
            o.planning,
            o.date_ordre
        FROM acc.ordre_travail AS o
        JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux
        WHERE t.nom_travail = $1 AND o.is_deleted = false
    `;

    db.query(sql, [nom_travail], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length === 0) return res.status(404).json({ error: "Ordre not found for this travail" });
        return res.status(200).json(result.rows[0]);
    });
}


exports.getTechnicienByMatricule = async (req, res) => {
    const matricule_techn = req.params.matricule_techn;
    const sql = "SELECT matricule_techn, nom, prenom, email_techn, specialite FROM acc.technicien WHERE matricule_techn=$1 AND is_deleted = false";
    //idvehicule,
    db.query(sql, [matricule_techn], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.getAtelierByNom = async (req, res) => {
    const nom_atelier = req.params.nom_atelier;
    const sql = "SELECT  nom_atelier, telephone, email FROM acc.atelier WHERE nom_atelier=$1 AND is_deleted = false";
    //idvehicule,
    db.query(sql, [nom_atelier], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}
