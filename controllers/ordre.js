const db = require("../db/db");
const moment = require("moment");
//const { content } = require("pdfkit/js/page");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const path = require('path');


exports.generateRapport = async (req, res) => {
    try {
        let conditions = [];
        let values = [];
        let paramIndex = 1;

        if (req.query.id_diagnostic) {
            conditions.push(`o.id_diagnostic = $${paramIndex}`);
            values.push(req.query.id_diagnostic);
            paramIndex++;
        }

        if (req.query.id_atelier) {
            conditions.push(`o.id_atelier = $${paramIndex}`);
            values.push(req.query.id_atelier);
            paramIndex++;
        }

        if (req.query.id_technicien) {
            conditions.push(`o.id_technicien = $${paramIndex}`);
            values.push(req.query.id_technicien);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }

        if (req.query.nom_atelier) {
            conditions.push(`a.nom_atelier ILIKE $${paramIndex}`);
            values.push(`%${req.query.nom_atelier}%`);
            paramIndex++;
        }

        //technicien
        if (req.query.matricule_techn) {
            conditions.push(`(tech.matricule_techn || ' ' || tech.nom || ' ' || tech.prenom) ILIKE $${paramIndex}`);
            values.push(`%${req.query.matricule_techn}%`);
            paramIndex++;
        }

        if (req.query.date_ordre) {
            conditions.push(`o.date_ordre::DATE = $${paramIndex}`);
            values.push(`%${req.query.date_ordre}%`);
            paramIndex++;
        }

        if (req.query.status) {
            conditions.push(`o.status ILIKE $${paramIndex}`);
            values.push(req.query.status);
            paramIndex++;
        }

        // Construction de la requête SQL
        let sql = `
            SELECT o.id_ordre,
                diag.id_diagnostic,
                diag.description_panne,
                diag.causes_panne,
                diag.actions,
                diag.date_diagnostic,
                diag.heure_diagnostic,
                o.urgence_panne,
                t.nom_travail,
                o.planning,
                o.date_ordre,
                o.status,
                a.nom_atelier,
                a.telephone,
                a.email,
                a.capacite,
                a.statut,
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
            WHERE o.is_deleted= false
        `;

        if (conditions.length > 0) {
            sql += " AND " + conditions.join(" AND ");
        }

        // Exécution de la requête
        db.query(sql, values, async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const records = result.rows;

            // Génération du PDF
            const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

            const logoPath = path.join(__dirname, '../assets/srtj.png');
            if (fs.existsSync(logoPath)) {
                const imageData = fs.readFileSync(logoPath);
                const base64Image = `data:image/png;base64,${imageData.toString('base64')}`;
                doc.addImage(base64Image, 'PNG', 35, 30, 70, 50);
            }

            // En-tête et autres informations
            doc.setFontSize(14).setFont('helvetica', 'bold').text('S.R.T JENDOUBA', 420, 50, { align: 'left' });
            doc.setFontSize(12).setFont('helvetica').text('Division Technique', 420, 70, { align: 'left' });
            doc.setFontSize(12).setFont('helvetica').text('Service Maintenance', 420, 85, { align: 'left' });

            doc.setFontSize(18).text('Ordre de travail - SRT Jendouba', 300, 130, { align: 'center', underline: true });
            doc.setFontSize(11).text(`Généré le : ${new Date().toLocaleDateString()}`, 300, 150, { align: 'center' });

            // Affichage des filtres appliqués
            let yPos = 150;
            if (req.query.numparc || req.query.nom_atelier || req.query.matricule_techn || req.query.status || req.query.date_ordre) {
                let dateRange = '';
                if (req.query.numparc) {
                    dateRange = `From ${req.query.numparc}`;

                } else if (req.query.nom_atelier) {
                    dateRange = `From ${req.query.nom_atelier}`;

                } else if (req.query.matricule_techn) {
                    dateRange = `From ${req.query.matricule_techn}`;

                } else if (req.query.status) {
                    dateRange = `From ${req.query.status}`;
                }
                else {
                    dateRange = `Until ${req.query.date_ordre}`;
                }
                //doc.text(`Date Range: ${dateRange}`, 14, yPos);
                yPos += 8;
            }

            // Tableau des résultats
            const tableColumn = ['ID', 'Vehicle', 'Emergency Breakdown', 'Works', 'Planning', 'Order Date', 'Status', 'Workshops', 'Technician'];

            const tableRows = records.map(record => [
                record.id_ordre,
                record.numparc,
                record.urgence_panne,
                record.nom_travail,
                record.planning,
                new Date(record.date_ordre).toLocaleDateString(),
                record.status,
                record.nom_atelier,
                record.matricule_techn
            ]);

            autoTable(doc, {
                startY: yPos + 20,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [22, 160, 133] },
                styles: { fontSize: 9 }
            });

            doc.setFontSize(12).setFont('helvetica').text('Signature chef service', 420, 750, { align: 'left' });
            doc.setFontSize(12).setFont('helvetica').text('........................................', 420, 770, { align: 'left' });


            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="rapport_ordre_travail.pdf"');

            // Envoi du fichier PDF
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la génération du rapport.' });
    }
}

exports.generatePdf = async (req, res) => {
    try {
        const id_ordre = Number(req.params.id_ordre);

        console.log('ID Order received:', id_ordre);

        const sql = `SELECT o.id_ordre,
    diag.id_diagnostic,
    diag.description_panne,
    diag.causes_panne,
    diag.actions,
    diag.date_diagnostic,
    diag.heure_diagnostic,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    o.status,
    a.nom_atelier,
    a.telephone,
    a.email,
    a.capacite,
    a.statut,
    tech.nom,
    tech.prenom,
    tech.matricule_techn,
    tech.email_techn,
    tech.telephone_techn,
    tech.specialite,
    v.numparc
    FROM acc.ordre_travail AS o
    JOIN acc.diagnostic AS diag ON o.id_diagnostic = diag.id_diagnostic
    LEFT JOIN acc.travaux AS t ON o.id_travaux = t.id_travaux
    JOIN acc.atelier AS a ON o.id_atelier = a.id_atelier
    JOIN acc.technicien AS tech ON o.id_technicien = tech.id_technicien
    JOIN acc.demandes AS d ON diag.id_demande = d.id_demande
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
    WHERE id_ordre=$1`;


        db.query(sql, [id_ordre], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order Not Found!' });
            }

            const ordre = result.rows[0];


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

                /*doc.fontSize(12).font('Helvetica-Bold').text('S.R.T JENDOUBA', { align: 'right' });
                //doc.moveDown()
                doc.font('Helvetica').text('Division Technique', { align: 'right' });
                //doc.moveDown()
                doc.font('Helvetica').text('service Maintenance', { align: 'right' });*/
            }
            doc.x = 50;

            //doc.moveTo(50, 100).lineTo(550, 100).stroke();
            doc.moveDown(2);
            //doc.y = 120;
            doc.fontSize(25)
                .font('Helvetica')
                .text(`Ordre de travail N° ${ordre.id_ordre} - SRT Jendouba`, {
                    align: 'center',
                    underline: true,
                });
            doc.moveDown(1);

            doc.fontSize(13).font('Helvetica-Bold').text(`Numéro de Vehicule: ${ordre.numparc}`);
            doc.moveDown(1);

            //diagnostic
            doc.fontSize(15).font('Helvetica-Bold').text('Diagnostic et controle:', 50, doc.y, { underline: true });
            doc.font('Helvetica').text(`Description de panne: ${ordre.description_panne}`)
            doc.font('Helvetica').text(`causes: ${ordre.causes_panne}`);
            doc.font('Helvetica').text(`Actions: ${ordre.actions}`);
            doc.font('Helvetica').text(`Date de diagnostic: ${ordre.date_diagnostic}`);
            doc.font('Helvetica').text(`heure de diagnostic: ${ordre.heure_diagnostic}`);

            doc.moveDown(1);

            //atelier
            doc.fontSize(15).font('Helvetica-Bold').text('Atelier de réparation:', { underline: true });
            doc.font('Helvetica').text(`Nom de l'atelier: ${ordre.nom_atelier}`);
            doc.font('Helvetica').text(`Email: ${ordre.email}`);
            doc.font('Helvetica').text(`Capacité d'accueil : ${ordre.capacite}`);
            doc.font('Helvetica').text(`Telephone: ${ordre.telephone}`);

            doc.moveDown(1);

            //technicien
            doc.fontSize(15).font('Helvetica-Bold').text('Technicien Concerné :', { underline: true });
            doc.font('Helvetica').text(`Numéro de technicien: ${ordre.matricule_techn}`);
            doc.font('Helvetica').text(`Nom: ${ordre.nom} ${ordre.prenom}`);
            doc.font('Helvetica').text(`E-mail: ${ordre.email_techn}`);
            doc.font('Helvetica').text(`Téléphone: ${ordre.telephone_techn}`);
            doc.font('Helvetica').text(`Specialité: ${ordre.specialite}`);

            doc.fontSize(14).font('Helvetica').text('----------------------------------------------------------------------------------------------------');

            doc.moveDown(1);

            // Informations de la demande
            doc.fontSize(14).font('Helvetica');
            doc.font('Helvetica-Bold').text(`Information sur L'ordre de travail ${ordre.id_ordre}`);
            doc.font('Helvetica').text(`Travail à faire: ${ordre.nom_travail}`);
            doc.font('Helvetica').text(`Plannification de L'intervention: ${ordre.planning}`);
            doc.font('Helvetica').text(`Date de création: ${ordre.date_ordre?.toLocaleDateString?.() || ordre.date_ordre}`);

            doc.moveDown(1); // saut de 2 lignes

            const y = doc.y + 20; // position verticale actuelle + un petit espace

            doc.fontSize(12);
            doc.text('Jendouba le  ......./....../.........', 50, y); // côté gauche
            doc.text('Signature Chef Service', 467, y);   // côté droit

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

        if (req.query.id_diagnostic) {
            conditions.push(`diag.id_diagnostic = $${paramIndex}`);
            values.push(req.query.id_diagnostic);
            paramIndex++;
        }

        if (req.query.id_atelier) {
            conditions.push(`a.id_atelier = $${paramIndex}`);
            values.push(req.query.id_atelier);
            paramIndex++;
        }

        if (req.query.id_technicien) {
            conditions.push(`tech.id_technicien = $${paramIndex}`);
            values.push(req.query.id_technicien);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }

        //diag
        if (req.query.date_diagnostic) {
            conditions.push(`diag.date_diagnostic::text ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_diagnostic}%`);
            paramIndex++;
        }

        //atelier
        if (req.query.nom_atelier) {
            conditions.push(`a.nom_atelier = $${paramIndex}`);
            values.push(`%${req.query.nom_atelier}%`);
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

        let sql = `SELECT o.id_ordre,
    diag.id_diagnostic,
    diag.description_panne,
    diag.causes_panne,
    diag.actions,
    diag.date_diagnostic,
    diag.heure_diagnostic,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    o.status,
    a.nom_atelier,
    a.telephone,
    a.email,
    a.capacite,
    a.statut,
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
    WHERE o.is_deleted= false`;


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
    const sql = `SELECT o.id_ordre,
    diag.id_diagnostic,
    diag.description_panne,
    diag.causes_panne,
    diag.actions,
    diag.date_diagnostic,
    diag.heure_diagnostic,
    o.urgence_panne,
    t.nom_travail,
    o.planning,
    o.date_ordre,
    o.status,
    a.nom_atelier,
    a.telephone,
    a.email,
    a.capacite,
    a.statut,
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
    WHERE o.is_deleted= false;`;

    //-- Jointure avec demandes
    //-- Jointure avec vehicule à partir de demandes

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}

exports.show = async (req, res) => {
    const id_ordre = Number(req.params.id_ordre);
    const sql = "SELECT * FROM acc.ordre_travail WHERE id_ordre=$1 AND is_deleted= false";

    db.query(sql, [id_ordre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order not found!" });
        }

        return res.status(200).json(result.rows);
    });
}


exports.create = async (req, res) => {
    try {
        const { diagnostic, urgence_panne, travaux, planning, date_ordre, atelier, technicien } = req.body;

        // Vérification que les données sont présentes
        if (!diagnostic || !atelier || !technicien || !travaux) {
            return res.status(400).json({ error: "Missing diagnostic or workshop or technician or works" });
        }

        const { description_panne } = diagnostic;
        const { nom_travail } = travaux;
        const { nom_atelier } = atelier;
        const { matricule_techn } = technicien;

        // Vérification des données
        if (!description_panne || !nom_travail || !nom_atelier || !matricule_techn) {
            return res.status(400).json({ error: "Missing information for vehicle or driver or works" });
        }

        const diagnosticResult = await db.query("SELECT id_diagnostic FROM acc.diagnostic WHERE description_panne = $1 AND is_deleted= false", [description_panne]);
        if (diagnosticResult.rows.length === 0) {
            return res.status(400).json({ error: "diagnostic not found!" });
        }
        const id_diagnostic = diagnosticResult.rows[0].id_diagnostic;

        const atelierResult = await db.query("SELECT id_atelier FROM acc.atelier WHERE nom_atelier = $1 AND is_deleted= false", [nom_atelier]);
        if (atelierResult.rows.length === 0) {
            return res.status(400).json({ error: "atelier not found!" });
        }
        const id_atelier = atelierResult.rows[0].id_atelier;


        const technicienResult = await db.query("SELECT id_technicien FROM acc.technicien WHERE matricule_techn = $1 AND is_deleted= false", [matricule_techn]);
        if (technicienResult.rows.length === 0) {
            return res.status(400).json({ error: "technicien not found!" });
        }
        const id_technicien = technicienResult.rows[0].id_technicien;

        const travauxResult = await db.query("SELECT id_travaux FROM acc.travaux WHERE nom_travail = $1", [nom_travail]);
        if (travauxResult.rows.length === 0) {
            return res.status(400).json({ error: "works not found!" });
        }
        const id_travaux = travauxResult.rows[0].id_travaux;


        const formattedDateOrdre = moment(date_ordre, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const status = "En attente";

        const sql = `INSERT INTO acc.ordre_travail(id_diagnostic, urgence_panne, id_travaux, planning, date_ordre, status, id_atelier, id_technicien) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id_diagnostic, urgence_panne, id_travaux, planning, date_ordre, status, id_atelier, id_technicien`;

        db.query(sql, [id_diagnostic, urgence_panne, id_travaux, planning, formattedDateOrdre, status, id_atelier, id_technicien], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(200).json({ message: "work order added successfully!", order: result.rows[0] });
        });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


exports.update = async (req, res) => {
    try {
        const id_ordre = Number(req.params.id_ordre);

        const { diagnostic, urgence_panne, travaux, planning, date_ordre, status, atelier, technicien } = req.body;

        if (!id_ordre) {
            return res.status(400).json({ error: "Missing ID of Order " });
        }

        // Vérification que les données sont présentes
        if (!diagnostic || !atelier || !technicien || !travaux) {
            return res.status(400).json({ error: "Missing diagnostic or workshop or technician or works" });
        }

        const { description_panne } = diagnostic;
        const { nom_atelier } = atelier;
        const { matricule_techn } = technicien;
        const { nom_travail } = travaux;

        // Vérification des données
        if (!description_panne || !nom_atelier || !matricule_techn || !nom_travail) {
            return res.status(400).json({ error: "Missing information for vehicle or driver or works" });
        }

        const diagnosticResult = await db.query("SELECT id_diagnostic FROM acc.diagnostic WHERE description_panne = $1 AND is_deleted= false", [description_panne]);
        if (diagnosticResult.rows.length === 0) {
            return res.status(400).json({ error: "diagnostic not found!" });
        }
        const id_diagnostic = diagnosticResult.rows[0].id_diagnostic;

        const atelierResult = await db.query("SELECT id_atelier FROM acc.atelier WHERE nom_atelier = $1 AND is_deleted= false", [nom_atelier]);
        if (atelierResult.rows.length === 0) {
            return res.status(400).json({ error: "atelier not found!" });
        }
        const id_atelier = atelierResult.rows[0].id_atelier;


        const technicienResult = await db.query("SELECT id_technicien FROM acc.technicien WHERE matricule_techn = $1 AND is_deleted= false", [matricule_techn]);
        if (technicienResult.rows.length === 0) {
            return res.status(400).json({ error: "technicien not found!" });
        }
        const id_technicien = technicienResult.rows[0].id_technicien;

        const travauxResult = await db.query("SELECT id_travaux FROM acc.travaux WHERE nom_travail = $1", [nom_travail]);
        if (travauxResult.rows.length === 0) {
            return res.status(400).json({ error: "works not found!" });
        }
        const id_travaux = travauxResult.rows[0].id_travaux;


        const formattedDateOrdre = moment(date_ordre, 'YYYY-MM-DD').format("YYYY-MM-DD");

        const sql = `UPDATE acc.ordre_travail SET id_diagnostic=$1, urgence_panne=$2, id_travaux=$3, 
        planning=$4, date_ordre=$5, 
        status=$6, id_atelier=$7, id_technicien=$8
        WHERE id_ordre = $9
        RETURNING *`;

        db.query(sql, [id_diagnostic, urgence_panne, id_travaux, planning, formattedDateOrdre, status, id_atelier, id_technicien, id_ordre], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Vérifier si la mise à jour a bien eu lieu
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Order not found!" });
            }

            return res.status(200).json({ message: "work order updated successfully!", order: result.rows[0] });
        });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.delete = async (req, res) => {
    const id_ordre = Number(req.params.id_ordre);
    //const sql = "DELETE FROM acc.ordre_travail WHERE id_ordre=$1 RETURNING *";

    const sql = "UPDATE acc.ordre_travail SET is_deleted = true WHERE id_ordre = $1 RETURNING id_ordre";

    db.query(sql, [id_ordre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: "Order deleted successfully", order: result.rows });
    });
}

//selection
exports.getDiagnosticByPanne = async (req, res) => {
    const description_panne = req.params.description_panne;
    const sql = "SELECT description_panne, causes_panne, actions, date_diagnostic, heure_diagnostic FROM acc.diagnostic WHERE description_panne=$1 AND is_deleted= false";
    //idvehicule,
    db.query(sql, [description_panne], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.getAtelierByNom = async (req, res) => {
    const nom_atelier = req.params.nom_atelier;
    const sql = "SELECT  nom_atelier, telephone, email, capacite FROM acc.atelier WHERE nom_atelier=$1 AND is_deleted= false";
    //idvehicule,
    db.query(sql, [nom_atelier], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.getTechnicienByMatricule = async (req, res) => {
    const matricule_techn = req.params.matricule_techn;
    const sql = "SELECT  matricule_techn, nom, prenom, telephone_techn, email_techn, specialite FROM acc.technicien WHERE matricule_techn=$1 AND is_deleted= false";
    //idvehicule,
    db.query(sql, [matricule_techn], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.getTravauxByNom = async (req, res) => {
    const nom_travail = req.params.nom_travail;
    const sql = "SELECT nom_travail FROM acc.travaux WHERE nom_travail=$1";
    //idvehicule,
    db.query(sql, [nom_travail], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.updateStatus = async (req, res) => {
    const id_ordre = Number(req.params.id_ordre);
    const { status } = req.body;

    sql = "UPDATE acc.ordre_travail SET status=$1 WHERE id_ordre=$2";

    db.query(sql, [status, id_ordre], (err, result) => {
        if (err) res.status(500).json({ error: err.message });
        res.status(200).json({ message: "status updated successfully!", demande: result.rows });
    });
}
