const db = require("../db/db");
const moment = require('moment');
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePdf = async (req, res) => {
    try {
        const id_demande = Number(req.params.id_demande);

        console.log('ID Demande reçu:', id_demande);

        const sql = ` SELECT d.id_demande, 
        d.date_demande,
        d.type_avarie,
        d.description,
        d.date_avarie,
        d.heure_avarie,
        d.statut,
        v.numparc,
        v.immatricule,
        v.modele,
        v.annee,
        v.etat,
        c.nom,
        c.prenom,
        c.matricule_chauf,
        c.cin,
        c.telephone,
        c.email
        FROM acc.demandes AS d
        JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
        JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf 
        WHERE id_demande=$1`;

        db.query(sql, [id_demande], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Demande non trouvée' });
            }

            const demande = result.rows[0];


            //Création du PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

            doc.pipe(res); // envoyer directement dans la réponse


            const logoPath = 'assets/srtj.png'; // chemin relatif vers ton logo
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 30, { width: 50 }); // x = 50, y = 30, largeur = 80
                //doc.moveDown(); // petit espace après le logo

                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Société Regionale de Transport de Jendouba', { align: 'right' });
            }
            doc.moveTo(50, 100).lineTo(550, 100).stroke();
            doc.moveDown(3); // saut de 2 lignes

            doc.fontSize(25)
                .font('Helvetica-Bold')
                .text('Fiche de demande d\'avarie - SRT Jendouba', {
                    align: 'center',
                    underline: true,
                });

            doc.moveDown(1); // saut de 2 lignes

            // Informations de la demande
            doc.fontSize(14).font('Helvetica');
            doc.text(`La demande N° ${demande.id_demande}`);
            doc.text(`Créer le: ${demande.date_demande?.toLocaleDateString?.() || demande.date_demande}`);
            doc.text(`Type: ${demande.type_avarie}`);
            doc.text(`Description: ${demande.description}`);
            doc.text(`Date de Panne: ${demande.date_avarie?.toLocaleDateString?.() || demande.date_avarie}`);
            doc.text(`Heure de panne: ${demande.heure_avarie}`);
            doc.text(`Demande: ${demande.statut}`);

            doc.moveDown(1);

            //vehicule
            doc.fontSize(16).text('Véhicule concerné :', { underline: true });
            doc.text(`numparc: ${demande.numparc}`);
            doc.text(`immatricule: ${demande.immatricule}`);
            doc.text(`modèle: ${demande.modele}`);
            doc.text(`année: ${demande.annee}`);

            doc.moveDown(1);

            //Chauffeur
            doc.fontSize(16).text('Le Déclarant :', { underline: true });
            doc.text(`matricule chauffeur: ${demande.matricule_chauf}`);
            doc.text(`nom: ${demande.nom} ${demande.prenom}`);
            doc.text(`cin: ${demande.cin}`);
            doc.text(`telephone: ${demande.telephone}`);
            doc.text(`email: ${demande.email}`);

            doc.moveDown(4); // saut de 2 lignes

            /*// Pied de page: Jendouba le ...
            doc.fontSize(12).text(`Jendouba le `, { align: 'left' });//`Jendouba le ${currentDate}`
            doc.text('....../...../........', { align: 'left' });

            //doc.moveDown(4); // espace avant la signature

            // Signature
            doc.text('Signature :', { align: 'right' });
            doc.text('...................', { align: 'right' });
*/
            const y = doc.y + 20; // position verticale actuelle + un petit espace

            doc.fontSize(12);
            doc.text('Jendouba le ......./....../.........', 50, y); // côté gauche
            doc.text('Signature : ...................', 476, y);   // côté droit

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

        // Build dynamic query based on provided search parameters
        if (req.query.id_vehicule) {
            conditions.push(`d.id_vehicule = $${paramIndex}`);
            values.push(req.query.id_vehicule);
            paramIndex++;
        }

        if (req.query.id_chauffeur) {
            conditions.push(`d.id_chauffeur = $${paramIndex}`);
            values.push(req.query.id_chauffeur);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }

        if (req.query.matricule_chauf) {
            conditions.push(`(c.matricule_chauf || ' ' || c.nom || ' ' || c.prenom) ILIKE $${paramIndex}`);
            values.push(`%${req.query.matricule_chauf}%`);
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

        if (req.query.date_avarie) {
            conditions.push(`d.date_avarie ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_avarie}%`);
            paramIndex++;
        }

        if (req.query.heure_avarie) {
            conditions.push(`d.heure_avarie ILIKE $${paramIndex}`);
            values.push(`%${req.query.heure_avarie}%`);
            paramIndex++;
        }

        let sql = ` SELECT d.id_demande, 
        d.date_demande,
        d.type_avarie,
        d.description,
        d.date_avarie,
        d.heure_avarie,
        v.numparc,
        v.immatricule,
        v.modele,
        v.annee,
        v.etat,
        c.nom,
        c.prenom,
        c.matricule_chauf,
        c.cin,
        c.telephone,
        c.email
        FROM acc.demandes AS d
        JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
        JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf`;

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


exports.show = async (req, res) => {
    const id_demande = Number(req.params.id_demande);
    const sql = "SELECT * FROM acc.demandes WHERE id_demande=$1";

    db.query(sql, [id_demande], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}


exports.create = async (req, res) => {
    try {
        // Extraction des données depuis le corps de la requête
        const { date_demande, type_avarie, description, date_avarie, heure_avarie, statut, vehicule, chauffeur } = req.body;

        // Vérification que les données du véhicule et du chauffeur sont présentes
        if (!vehicule || !chauffeur) {
            return res.status(400).json({ error: "Missing vehicle or driver" });
        }

        const { numparc } = vehicule;
        const { nom } = chauffeur;

        // Vérification des données
        if (!numparc || !nom) {
            return res.status(400).json({ error: "Missing information for vehicle or driver" });
        }

        // 1. Récupérer l'ID du véhicule
        const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1", [numparc]);
        if (vehiculeResult.rows.length === 0) {
            return res.status(400).json({ error: "Vehicle not found!" });
        }
        const id_vehicule = vehiculeResult.rows[0].idvehicule;

        // 2. Récupérer l'ID du chauffeur
        const chauffeurResult = await db.query("SELECT id_chauf FROM acc.chauffeur WHERE nom = $1", [nom]);
        if (chauffeurResult.rows.length === 0) {
            return res.status(400).json({ error: "Driver not found!" });
        }
        const id_chauffeur = chauffeurResult.rows[0].id_chauf;

        // 3. Formater les dates
        const formattedDateDemande = moment(date_demande, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedDateAvarie = moment(date_avarie, 'YYYY-MM-DD').format("YYYY-MM-DD");

        // 4. Insérer la demande dans la base de données
        const sql = `
      INSERT INTO acc.demandes (date_demande, type_avarie, description, date_avarie, heure_avarie, statut= 'En attente', id_vehicule, id_chauffeur)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_demande, date_demande, type_avarie, description, date_avarie, heure_avarie, statut, id_vehicule, id_chauffeur
    `;
        const result = await db.query(sql, [formattedDateDemande, type_avarie, description, formattedDateAvarie, heure_avarie, statut, id_vehicule, id_chauffeur]);

        // 5. Retourner la demande enregistrée avec les IDs
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création de la demande:', err);
        return res.status(500).json({ error: err.message });
    }
};


exports.update = async (req, res) => {
    try {

        const id_demande = Number(req.params.id_demande);

        // Extraction des données depuis le corps de la requête
        const { date_demande, type_avarie, description, date_avarie, heure_avarie, statut, vehicule, chauffeur } = req.body;

        // Vérification que l'ID de la demande est bien fourni
        if (!id_demande) {
            return res.status(400).json({ error: "Missing ID of request " });
        }

        // Vérification que les données du véhicule et du chauffeur sont présentes
        if (!vehicule || !chauffeur) {
            return res.status(400).json({ error: "Missing driver or vehicle" });
        }

        const { numparc } = vehicule;
        const { nom } = chauffeur;

        // Vérification des données
        if (!numparc || !nom) {
            return res.status(400).json({ error: "Missing information for vehicle or driver" });
        }

        // 1. Récupérer l'ID du véhicule
        const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1", [numparc]);
        if (vehiculeResult.rows.length === 0) {
            return res.status(400).json({ error: "Vehicle not found!" });
        }
        const id_vehicule = vehiculeResult.rows[0].idvehicule;
        //const vehiculeInfo = vehiculeResult.rows[0];

        // 2. Récupérer l'ID du chauffeur
        const chauffeurResult = await db.query("SELECT id_chauf FROM acc.chauffeur WHERE nom = $1", [nom]);
        if (chauffeurResult.rows.length === 0) {
            return res.status(400).json({ error: "Driver not found" });
        }
        const id_chauffeur = chauffeurResult.rows[0].id_chauf;
        //const chauffeurInfo = chauffeurResult.rows[0];

        // 3. Formater les dates
        const formattedDateDemande = moment(date_demande, 'YYYY-MM-DD').format("YYYY-MM-DD");
        const formattedDateAvarie = moment(date_avarie, 'YYYY-MM-DD').format("YYYY-MM-DD");

        // 4. Mettre à jour la demande dans la base de données
        const sql = `
            UPDATE acc.demandes 
            SET date_demande = $1, type_avarie = $2, description = $3, date_avarie = $4, 
                heure_avarie = $5, statut = $6, id_vehicule = $7, id_chauffeur = $8 
            WHERE id_demande = $9 
            RETURNING *`;

        const result = await db.query(sql, [
            formattedDateDemande, type_avarie, description, formattedDateAvarie, heure_avarie, statut, id_vehicule, id_chauffeur, id_demande
        ]);


        // Vérifier si la mise à jour a bien eu lieu
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Request not found!" });
        }

        // 5. Retourner la demande mise à jour
        return res.status(200).json({ message: "Request updated successfully", demande: result.rows[0] });
        //return res.status(200).json({ message: "Demande mise à jour avec succès", demandeInfo: { ...vehiculeInfo, ...chauffeurInfo } });


    } catch (error) {
        console.error('Erreur lors de la mise à jour de la demande:', error);
        return res.status(500).json({ error: error.message });
    }
};


exports.delete = async (req, res) => {
    const id_demande = Number(req.params.id_demande);
    const sql = "DELETE FROM acc.demandes WHERE id_demande=$1";

    db.query(sql, [id_demande], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: "request deleted successfully" });
    });
}


// Route pour obtenir les informations du véhicule par numparc
exports.getVehiculeByNumparc = async (req, res) => {
    const numparc = req.params.numparc;
    const sql = "SELECT  numparc, immatricule, modele FROM acc.vehicule WHERE numparc=$1";
    //idvehicule,
    db.query(sql, [numparc], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}


// Route pour obtenir les informations du chauffeur par nom
exports.getChauffeurByNom = async (req, res) => {
    const nom = req.params.nom;
    const sql = "SELECT  nom, prenom, matricule_chauf, cin, telephone, email FROM acc.chauffeur WHERE nom=$1";
    //id_chauf,
    db.query(sql, [nom], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}

exports.getDemande = async (req, res) => {
    const id_demande = req.params.id_demande;

    if (!id_demande) {
        return res.status(400).json({ error: 'id_demande is required' });
    }

    const sql = `SELECT d.*, 
                        v.numparc, 
                        v.immatricule,
                        v.modele,
                        c.nom,
                        c.prenom,
                        c.matricule_chauf,
                        c.telephone,
                        c.cin,
                        c.email
                 FROM acc.demandes AS d
                 JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
                 JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf
                 WHERE d.id_demande = $1;`;

    db.query(sql, [id_demande], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Demande not found' });
        }

        return res.status(200).json(result.rows);
    });
}