const db = require("../db/db");
const PDFDocument = require('pdfkit');
const fs = require('fs');


exports.genrateAllDemandes = async (req, res) => {
    try {

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
        JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule AND v.is_deleted = false
        JOIN acc.chauffeur AS c ON d.id_chauffeur = c.id_chauf AND c.is_deleted = false
        WHERE d.is_deleted = false`;

        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            console.log(result.rows); // Affiche les données pour inspection
            const demande = result.rows;

            // Création du PDF
            const doc = new PDFDocument({ layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="demandes.pdf"');

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
                .text('Fiche des demandes d\'avaries - SRT Jendouba', {
                    align: 'center',
                    underline: true,
                });

            doc.moveDown(1); // saut de 2 lignes

            // Titre du tableau
            doc.fontSize(14).font('Helvetica-Bold');
            doc.text('Liste des demandes', { align: 'center' });
            doc.moveDown(1);

            
            // Informations de la demande
             doc.fontSize(14).font('Helvetica');
             doc.text(`${demande.id_demande}`);
             doc.text(`${demande.date_demande?.toLocaleDateString?.() || demande.date_demande}`);
             doc.text(` ${demande.type_avarie}`);
             doc.text(`${demande.description}`);
             doc.text(`${demande.date_avarie?.toLocaleDateString?.() || demande.date_avarie}`);
             doc.text(`${demande.heure_avarie}`);
             doc.text(`${demande.statut}`);
 
             doc.moveDown(1);
 
             //vehicule
             doc.fontSize(16).text('Véhicule concerné :', { underline: true });
             doc.text(`numparc: ${demande.numparc}`);
             doc.text(`immatricule: ${demande.immatricule}`);
             doc.text(`modèle: ${demande.modele}`);
             doc.text(`année: ${demande.annee}`);
 
             doc.moveDown(1);
 
             //Chauffeur
             doc.fontSize(16).text('Déclarant :', { underline: true });
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