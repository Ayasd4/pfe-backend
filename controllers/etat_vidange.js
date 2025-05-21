const db = require('../db/db');
const moment = require('moment');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const path = require('path');
const fs = require('fs');

exports.generateRapport = async (req, res) => {
    try {
        let conditions = [];
        let values = [];
        let paramIndex = 1;

        if (req.query.id_kilometrage) {
            conditions.push(`e.id_kilometrage = $${paramIndex}`);
            values.push(req.query.id_kilometrage);
            paramIndex++;
        }

        if (req.query.km_derniere_vd) {
            conditions.push(`e.km_derniere_vd = $${paramIndex}`);
            values.push(req.query.km_derniere_vd);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }

        if (req.query.calcul) {
            conditions.push(`k.calcul = $${paramIndex}`);
            values.push(req.query.calcul);
            paramIndex++;
        }

        if (req.query.km_vidange) {
            conditions.push(`vd.km_vidange = $${paramIndex}`);
            values.push(req.query.km_vidange);
            paramIndex++;
        }
        // hedhi
        if (req.query.km_prochaine_vd) {
            conditions.push(`e.km_prochaine_vd = $${paramIndex}`);
            values.push(req.query.km_prochaine_vd);
            paramIndex++;
        }
        if (req.query.reste_km) {
            conditions.push(`e.reste_km = $${paramIndex}`);
            values.push(req.query.reste_km);
            paramIndex++;
        }

        if (req.query.date) {
            conditions.push(`e.date::DATE = $${paramIndex}`);
            values.push(`%${req.query.date}%`);
            paramIndex++;
        }

        //construction de la requéte 
        let sql = ` SELECT e.id_vidange,
        v.numparc,
        k."vehiculeId",
        k.calcul,
        COALESCE(vd.km_vidange, '0') AS km_vidange,
        e.km_prochaine_vd,
        e.reste_km,
        e.date
        FROM acc.etat_vidange AS e
        JOIN acc.vehicule AS v ON e.id_vehicule = v.idvehicule AND v.is_deleted = false
        JOIN acc.kilometrage AS k ON e.id_kilometrage = k.id AND k.is_deleted = false
        LEFT JOIN acc.vidanges AS vd ON e.km_derniere_vd = vd.km_vidange AND e.id_vehicule = vd.id_vehicule
        WHERE e.is_deleted = false
        `;

        if (conditions.length > 0) {
            sql += " AND " + conditions.join(" AND ");
        }

        // Exécution de la requête
        db.query(sql, values, async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const records = result.rows;
            // GéN2RALISATION RAPPORTING
            const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
            const logoPath = path.join(__dirname, '../assets/srtj.png');
            if (fs.existsSync(logoPath)) {
                const imageData = fs.readFileSync(logoPath);
                const base64Image = `data:image/png;base64,${imageData.toString('base64')}`;
                doc.addImage(base64Image, 'PNG', 35, 30, 70, 50);
            }
            doc.setFontSize(18).text('Etat de vidange- SRT Jendouba', 300, 130, { align: 'center', underline: true });
            doc.setFontSize(11).text(`Généré le : ${new Date().toLocaleDateString()}`, 300, 150, { align: 'center' });

            // Affichage des filtres appliqués
            let yPos = 150;
            if (req.query.numparc || req.query.calcul || req.query.km_vidange || req.query.km_prochaine_vd || req.query.reste_km || req.query.date) {
                let dateRange = '';
                if (req.query.numparc) {
                    dateRange = `From ${req.query.numparc}`;
                }
                else if (req.query.calcul) {
                    dateRange = `From ${req.query.calcul}`;

                } else if (req.query.km_vidange) {
                    dateRange = `From ${req.query.km_vidange}`

                } else if (req.query.km_prochaine_vd) {
                    dateRange = `From ${req.query.km_prochaine_vd}`;

                } else if (req.query.reste_km) {
                    dateRange = `From ${req.query.reste_km}`;

                } else {
                    dateRange = `Until ${req.query.date}`;
                }
                yPos += 8;
            }
            //table reslt
            const tableColumn = ['ID', 'Vehicle', 'index km', 'Date', 'Last Oil change', 'Next Oil change ', 'Remaining Km'];
            const tableRows = records.map(record => [
                record.id_vidange,
                record.numparc,
                record.calcul,
                new Date(record.date).toLocaleDateString(),
                record.km_vidange,
                record.km_prochaine_vd,
                record.reste_km,
            ]);


            autoTable(doc, {
                startY: yPos + 20,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [22, 160, 133] },
                styles: { fontSize: 9 }
            });
            doc.setFontSize(10).setFont('helvetica').text('Signature chef service maitrise de l\'énergie', 350, 750, { align: 'left' });
            doc.setFontSize(12).setFont('helvetica').text('.........................................................', 350, 770, { align: 'left' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="rapport_Etat vidange.pdf"');

            // Envoi du fichier PDF
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la génération du rapport.' });
    }
}

exports.list = async (req, res) => {
    const sql = ` SELECT e.id_vidange,
        v.numparc,
        k."vehiculeId",
        k.calcul,
        COALESCE(vd.km_vidange, '0') AS km_vidange,
        e.km_prochaine_vd,
        e.reste_km,
        e.date
        FROM acc.etat_vidange AS e
        JOIN acc.vehicule AS v ON e.id_vehicule = v.idvehicule AND v.is_deleted = false
        JOIN acc.kilometrage AS k ON e.id_kilometrage = k.id AND e.is_deleted = false
        LEFT JOIN acc.vidanges AS vd ON e.km_derniere_vd = vd.km_vidange AND e.id_vehicule = vd.id_vehicule
        WHERE e.is_deleted= false
        `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

exports.show = async (req, res) => {
    const id_vidange = Number(req.params.id_vidange);
    const sql = `SELECT * FROM acc.etat_vidange WHERE id_vidange=$1 AND is_deleted= false`;

    db.query(sql, [id_vidange], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vidange not found!" });
        }

        return res.status(200).json(result.rows);
    });
};

exports.create = async (req, res) => {
    try {
        const { vehicule, kilometrage, date } = req.body;

        const { numparc } = vehicule;
        const { calcul } = kilometrage;

        // 1. Récupérer l'ID du véhicule
        const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1 AND is_deleted= false", [numparc]);
        if (vehiculeResult.rows.length === 0) {
            return res.status(400).json({ error: "Vehicle not found!" });
        }
        const id_vehicule = vehiculeResult.rows[0].idvehicule;

        //2. Récupérer le km actuelle(calcul) de la table kilometrage 
               // const KmQuery = `SELECT id FROM acc.kilometrage WHERE calcul= $1 AND "vehiculeId" = $2 AND is_deleted= false ORDER BY date DESC LIMIT 1`;
        const KmQuery = `SELECT id FROM acc.kilometrage WHERE calcul= $1 AND "vehiculeId" = $2 ORDER BY date DESC LIMIT 1`;
        //const KmResult = await db.query(KmQuery, [calcul, id_vehicule]);
        const KmResult = await db.query(KmQuery, [calcul, id_vehicule]);
        if (KmResult.rows.length === 0) {
            return res.status(400).json({ error: "Matching mileage not found!" });
        }
        const id_kilometrage = KmResult.rows[0].id;
        //const KmActuel = KmResult.rows[0].calcul;

        const KmActuel = calcul;

        //3. Récupérer le km derniere vidange de la table vidange
        const vidangeQuery = `
          SELECT km_vidange 
          FROM acc.vidanges 
          WHERE id_vehicule = $1
          ORDER BY id_vd DESC 
          LIMIT 1
        `;
        const vidangeResult = await db.query(vidangeQuery, [id_vehicule]);

        //vidangeResult.rows.length > 0 ? si le vehicule a fait un vidange 
        //vidangeResult.rows[0].km_vidange : 0 si le vehicule n'a pas fait un vidange donc =0 
        const kmDerniereVidange = vidangeResult.rows.length > 0 ? vidangeResult.rows[0].km_vidange : 0;

        const frequce_km = 10000
        //4. calcul
        const kmDerniereVidangeNum = parseInt(kmDerniereVidange, 10);
        const kmProchaineVidange = kmDerniereVidangeNum + frequce_km;
        const resteKm = kmProchaineVidange - KmActuel;

        const formattedDate = moment(date, 'YYYY-MM-DD').format("YYYY-MM-DD");

        const sql = `INSERT INTO acc.etat_vidange(id_vehicule, id_kilometrage, km_derniere_vd, km_prochaine_vd, reste_km, date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;

        db.query(sql, [id_vehicule, id_kilometrage, kmDerniereVidange, kmProchaineVidange, resteKm, formattedDate], (err, result) => {
            if (err) return res.status(200).json({ error: err.message });
            return res.status(200).json({ message: "Planning Oil change added Successfully", vidange: result.rows[0] })
        });

    } catch (error) {
        console.error('Error while creating Oil change:', err);
        return res.status(500).json({ error: err.message });
    }
}

exports.update = async (req, res) => {
    try {
        const id_vidange = Number(req.params.id_vidange);
        const { vehicule, kilometrage, date } = req.body;

        const { numparc } = vehicule;
        const { calcul } = kilometrage;

        // 1. Récupérer l'ID du véhicule
        const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1", [numparc]);
        if (vehiculeResult.rows.length === 0) {
            return res.status(400).json({ error: "Vehicle not found!" });
        }
        const id_vehicule = vehiculeResult.rows[0].idvehicule;

        //2. Récupérer le km actuelle(calcul) de la table kilometrage 
        const KmQuery = `SELECT id FROM acc.kilometrage WHERE calcul=$1 AND "vehiculeId" = $2 ORDER BY date DESC LIMIT 1`;
        const KmResult = await db.query(KmQuery, [calcul, id_vehicule]);
        if (KmResult.rows.length === 0) {
            return res.status(400).json({ error: "Matching mileage not found!" });
        }
        const id_kilometrage = KmResult.rows[0].id;
        const KmActuel = calcul;

        // Vérifie que le kilometrage correspond bien au véhicule sélectionné
        /* const verifQuery = `SELECT "vehiculeId" FROM acc.kilometrage WHERE id = $1`;
         const verifResult = await db.query(verifQuery, [id_kilometrage]);
 
         if (verifResult.rows.length === 0 || verifResult.rows[0].vehiculeId !== id_vehicule) {
             return res.status(400).json({ error: "The selected mileage does not match the chosen vehicle!" });
         }*/


        //3. Récupérer le km derniere vidange de la table vidange
        const vidangeQuery = `
          SELECT km_vidange 
          FROM acc.vidanges 
          WHERE id_vehicule = $1 
          ORDER BY id_vd DESC LIMIT 1
        `;
        const vidangeResult = await db.query(vidangeQuery, [id_vehicule]);
        //vidangeResult.rows.length > 0 ? si le vehicule a fait un vidange 
        //vidangeResult.rows[0].km_vidange : 0 si le vehicule n'a pas fait un vidange donc =0 
        const kmDerniereVidange = vidangeResult.rows.length > 0 ? vidangeResult.rows[0].km_vidange : 0;

        const frequce_km = 10000;

        //4. calcul
        const kmDerniereVidangeNum = parseInt(kmDerniereVidange, 10);
        const kmProchaineVidange = kmDerniereVidangeNum + frequce_km;
        const resteKm = kmProchaineVidange - KmActuel;

        const formattedDate = moment(date, 'YYYY-MM-DD').format("YYYY-MM-DD");

        const sql = `UPDATE acc.etat_vidange SET id_vehicule=$1, id_kilometrage=$2, km_derniere_vd=$3, km_prochaine_vd=$4, reste_km=$5, date=$6
        WHERE id_vidange=$7
        RETURNING id_vehicule, id_kilometrage, km_derniere_vd, km_prochaine_vd, reste_km, date`;

        db.query(sql, [id_vehicule, id_kilometrage, kmDerniereVidange, kmProchaineVidange, resteKm, formattedDate, id_vidange], (err, result) => {
            if (err) return res.status(200).json({ error: err.message });
            return res.status(200).json({ message: "Planning Oil change updated Successfully", vidange: result.rows[0] })
        });

    } catch (error) {
        console.error('Error while creating Oil change:', error);
        return res.status(500).json({ error: error.message });
    }
}

exports.delete = async (req, res) => {
    const id_vidange = Number(req.params.id_vidange);
    //const sql = `DELETE FROM acc.etat_vidange WHERE id_vidange=$1`;
    const sql = "UPDATE acc.etat_vidange SET is_deleted = true WHERE id_vidange = $1 RETURNING id_vidange";

    db.query(sql, [id_vidange], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "Oil change deleted successfully!" });
    });
}






/*exports.getNumparc = async (req, res)=>{
    const sql = "SELECT numparc FROM acc.vehicule";

    db.query(sql, (err, result)=> {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vehicle not found!" });
        }

        return res.status(200).json(result.rows);
    });
}*/