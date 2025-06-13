// controllers/conStatistique.js
const db = require("../db/db");

exports.totalConsomationByVehiculeAndMonth = async (req, res) => {
    try {

        const numparc = req.params.numparc;

         // Vérifier si le véhicule existe d'abord
         const checkVehicule = await db.query('SELECT numparc FROM acc.vehicule WHERE numparc = $1 AND is_deleted= false', [numparc]);


         if (checkVehicule.rows.length === 0) {
             return res.status(404).json({ error: "Véhicule non trouvé" });
         }
 
         const sql = `
             SELECT c."numPark" AS vehicule_numparc,
                 EXTRACT(YEAR FROM c."dateDebut") AS annee,
                 EXTRACT(MONTH FROM c."dateDebut") AS mois,
                 SUM(c."QteCarb") AS total_consommation
             FROM acc."consomationCarb" c
             WHERE c."numPark" = $1 AND c.is_deleted= false
             GROUP BY c."numPark", annee, mois
             ORDER BY annee, mois
         `;

        const result = await db.query(sql, [numparc]);

        // Si le véhicule existe mais pas de consommation trouvée
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Aucune consommation trouvée pour ce véhicule" });
        }

        // Sinon renvoyer les résultats
        return res.status(200).json(result.rows);

        //const result = await db.query(sql);
        //return res.status(200).json(result.rows[0]);

    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
};