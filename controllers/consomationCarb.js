const db = require("../db/db");
const jsPDF = require('jspdf');
const { autoTable } = require('jspdf-autotable');

// Get all fuel consumption records
exports.list = async (req, res) => {
    const sql = `
        SELECT c.*,         
            v.numparc AS vehicule_numparc,
            ch.nom AS chauffeur_nom, 
            ch.prenom AS chauffeur_prenom,
            ch.matricule_chauf AS matricule_chauf,
            ch.matricule_chauf AS chauffeur_matricule,
            a.nom AS agence_nom
        FROM acc."consomationCarb" c
        LEFT JOIN acc.vehicule v ON c."idVehicule" = v.idvehicule AND v.is_deleted = false
        LEFT JOIN acc.chauffeur ch ON c."idChaff" = ch.id_chauf AND ch.is_deleted = false
        LEFT JOIN acc.agence a ON c."idAgence" = a.id_agence
        WHERE c.is_deleted = false
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

// Get fuel consumption record by ID
exports.show = async (req, res) => {
    const valueId = Number(req.params.idConsomation);
    const sql = `
        SELECT c.*, 
            v.numparc AS vehicule_numparc,
            ch.nom AS chauffeur_nom, 
            ch.prenom AS chauffeur_prenom,
            ch.matricule_chauf AS chauffeur_matricule,
            a.nom AS agence_nom
        FROM acc."consomationCarb" c
        LEFT JOIN acc.vehicule v ON c."idVehicule" = v.idvehicule AND v.is_deleted = false
        LEFT JOIN acc.chauffeur ch ON c."idChaff" = ch.id_chauf AND ch.is_deleted = false
        LEFT JOIN acc.agence a ON c."idAgence" = a.id_agence
        WHERE c."idConsomation" = $1 AND c.is_deleted = false
    `;
    db.query(sql, [valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};
// ajouter colone calcul
// Create new fuel consumption record
exports.create = async (req, res) => {
    const { numPark, QteCarb, indexkilo, dateDebut, idChaff, idVehicule, idAgence } = req.body;

    const qte = parseFloat(QteCarb)
    const index = parseFloat(indexkilo);

    const calcul_cons = ((qte / index) * 100).toFixed(2);

    const sql = "INSERT INTO acc.\"consomationCarb\"(\"numPark\", \"QteCarb\", indexkilo, \"dateDebut\", \"idChaff\", \"idVehicule\", \"idAgence\",calcul) VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *";

    db.query(sql, [numPark, QteCarb, indexkilo, dateDebut, idChaff, idVehicule, idAgence, calcul_cons], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(201).json({ message: "Fuel consumption record created", consomation: result.rows[0] });
    });
};
// Update fuel consumption record
// Update fuel consumption record
exports.update = async (req, res) => {
    const valueId = Number(req.params.idConsomation);
    const { numPark, QteCarb, indexkilo, dateDebut, idChaff, idVehicule, idAgence } = req.body;

    //const {idVehicule} = req.body;

    const qte = parseFloat(QteCarb);
    const index = parseFloat(indexkilo);
    const calcul_cons = ((qte / index) * 100).toFixed(2);

    const sql = `
        UPDATE acc."consomationCarb" 
        SET "numPark"=$1, "QteCarb"=$2, indexkilo=$3, "dateDebut"=$4, "idChaff"=$5, "idVehicule"=$6, "idAgence"=$7, "calcul"=$8 
        WHERE "idConsomation"=$9 
        RETURNING *
    `;

    db.query(sql, [numPark, QteCarb, indexkilo, dateDebut, idChaff, idVehicule, idAgence, calcul_cons, valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Fuel consumption record not found" });
        }
        return res.status(200).json({ message: "Fuel consumption record updated", consomation: result.rows[0] });
    });
};


// Delete fuel consumption record
exports.delete = async (req, res) => {
    const valueId = Number(req.params.idConsomation);
    const sql = "UPDATE acc.\"consomationCarb\" SET is_deleted = true WHERE \"idConsomation\"=$1 RETURNING \"idConsomation\" ";

    //const sql = "DELETE FROM acc.\"consomationCarb\" WHERE \"idConsomation\"=$1 RETURNING \"idConsomation\"";

    db.query(sql, [valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Fuel consumption record not found" });
        }
        return res.status(200).json({ message: "Fuel consumption record deleted", deletedId: result.rows[0]?.idConsomation });
    });
};

// Search fuel consumption records by various parameters
exports.search = async (req, res) => {
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    // Build dynamic query based on provided search parameters
    if (req.query.idVehicule) {
        conditions.push(`c.\"idVehicule\"=$${paramIndex}`);
        values.push(req.query.idVehicule);
        paramIndex++;
    }

    if (req.query.idChaff) {
        conditions.push(`c.\"idChaff\"=$${paramIndex}`);
        values.push(req.query.idChaff);
        paramIndex++;
    }

    if (req.query.idAgence) {
        conditions.push(`c.\"idAgence\"=$${paramIndex}`);
        values.push(req.query.idAgence);
        paramIndex++;
    }

    if (req.query.numPark) {
        conditions.push(`c.\"numPark\"=$${paramIndex}`);
        values.push(req.query.numPark);
        paramIndex++;
    }

    if (req.query.startDate && req.query.endDate) {
        conditions.push(`c.\"dateDebut\" >= $${paramIndex} `);
        values.push(req.query.startDate);
        values.push(req.query.endDate);
        paramIndex += 2;
    } else if (req.query.startDate) {
        conditions.push(`c.\"dateDebut\" >= $${paramIndex}`);
        values.push(req.query.startDate);
        paramIndex++;

    }

    let sql = `
        SELECT c.*, 
         
            v.numparc AS vehicule_numparc,
            ch.nom AS chauffeur_nom, 
            ch.prenom AS chauffeur_prenom,
            ch.matricule_chauf AS chauffeur_matricule,
            a.nom AS agence_nom
        FROM acc."consomationCarb" c
        LEFT JOIN acc.vehicule v ON c."idVehicule" = v.idvehicule AND V.is_deleted = false
        LEFT JOIN acc.chauffeur ch ON c."idChaff" = ch.id_chauf AND cH.is_deleted = false
        LEFT JOIN acc.agence a ON c."idAgence" = a.id_agence
        WHERE c.is_deleted = false
    `;

    if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
    }

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

// Export fuel consumption records to PDF
exports.exportToPdf = async (req, res) => {
    try {
        // Build query based on provided search parameters (similar to search function)
        let conditions = [];
        let values = [];
        let paramIndex = 1;

        // Build dynamic query based on provided search parameters
        if (req.query.idVehicule) {
            conditions.push(`c.\"idVehicule\"=$${paramIndex}`);
            values.push(req.query.idVehicule);
            paramIndex++;
        }

        if (req.query.idChaff) {
            conditions.push(`c.\"idChaff\"=$${paramIndex}`);
            values.push(req.query.idChaff);
            paramIndex++;
        }

        if (req.query.idAgence) {
            conditions.push(`c.\"idAgence\"=$${paramIndex}`);
            values.push(req.query.idAgence);
            paramIndex++;
        }

        if (req.query.numPark) {
            conditions.push(`c.\"numPark\"=$${paramIndex}`);
            values.push(req.query.numPark);
            paramIndex++;
        }

        if (req.query.startDate && req.query.endDate) {
            conditions.push(`c.\"dateDebut\" >= $${paramIndex} AND c.\"dateFin\" <= $${paramIndex + 1}`);
            values.push(req.query.startDate);
            values.push(req.query.endDate);
            paramIndex += 2;
        } else if (req.query.startDate) {
            conditions.push(`c.\"dateDebut\" >= $${paramIndex}`);
            values.push(req.query.startDate);
            paramIndex++;

        }

        let sql = `
            SELECT c.*, 
            
                v.numparc AS vehicule_numparc,
                ch.nom AS chauffeur_nom, 
                ch.prenom AS chauffeur_prenom,
                ch.matricule_chauf AS chauffeur_matricule,
                a.nom AS agence_nom
            FROM acc."consomationCarb" c
            LEFT JOIN acc.vehicule v ON c."idVehicule" = v.idvehicule AND v.is_deleted = false
            LEFT JOIN acc.chauffeur ch ON c."idChaff" = ch.id_chauf AND c.is_deleted = false
            LEFT JOIN acc.agence a ON c."idAgence" = a.id_agence AND a.is_deleted = false
            WHERE c.is_deleted = false
        `;

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // Execute query
        db.query(sql, values, async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const records = result.rows;

            // Create a new PDF document
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(18);
            doc.text('Fuel Consumption Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            // Add filters information if any
            let yPos = 38;
            if (req.query.startDate || req.query.endDate) {
                let dateRange = '';
                if (req.query.startDate && req.query.endDate) {
                    dateRange = `From ${req.query.startDate} to ${req.query.endDate}`;
                } else if (req.query.startDate) {
                    dateRange = `From ${req.query.startDate}`;
                } else {
                    dateRange = `Until ${req.query.endDate}`;
                }
                doc.text(`Date Range: ${dateRange}`, 14, yPos);
                yPos += 8;
            }

            // Prepare data for table
            const tableColumn = [
                'ID', 'Park #', 'Fuel Qty', 'Kilometers', 'Start Date',
                'Vehicle', 'Driver', 'Agency'
            ];

            const tableRows = records.map(record => [
                record.idConsomation,
                record.numPark,
                record.QteCarb,
                record.indexkilo,
                new Date(record.dateDebut).toLocaleDateString(),
                `${record.chauffeur_nom} ${record.chauffeur_prenom}`,
                record.agence_nom
            ]);

            // Generate the table
            autoTable(doc, {
                startY: yPos,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [66, 139, 202] }
            });

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=fuel-consumption-report.pdf');

            // Send the PDF as response
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            res.send(pdfBuffer);
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF report' });
    }
};