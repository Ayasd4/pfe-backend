const db = require('../db/db');
const moment = require('moment');


exports.search = async (req, res) => {
    try {
        let conditions = [];
        let values = [];
        let paramIndex = 1;

        // Build dynamic query based on provided search parameters
        if (req.query.id_vehicule) {
            conditions.push(`vd.id_vehicule = $${paramIndex}`);
            values.push(req.query.id_vehicule);
            paramIndex++;
        }

        if (req.query.numparc) {
            conditions.push(`v.numparc = $${paramIndex}`);
            values.push(req.query.numparc);
            paramIndex++;
        }


        if (req.query.date_vidange) {
            conditions.push(`vd.date_vidange ILIKE $${paramIndex}`);
            values.push(`%${req.query.date_vidange}%`);
            paramIndex++;
        }

        if (req.query.km_vidange) {
            conditions.push(`CAST(vd.km_vidange AS TEXT) ILIKE $${paramIndex}`);
            values.push(`%${req.query.km_vidange}%`);
            paramIndex++;
        }


        let sql = ` SELECT vd.id_vd,
        v.numparc,
        vd.date_vidange,
        vd.km_vidange
        FROM acc.vidanges AS vd
        JOIN acc.vehicule AS v ON vd.id_vehicule = v.idvehicule
        WHERE is_deleted = false`;

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
    const sql = ` SELECT vd.id_vd,
        v.numparc,
        vd.date_vidange,
        vd.km_vidange
        FROM acc.vidanges AS vd
        JOIN acc.vehicule AS v ON vd.id_vehicule = v.idvehicule
        WHERE is_deleted = false`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
};

exports.show = async (req, res) => {
    const id_vd = Number(req.params.id_vd);
    const sql = `
        SELECT * FROM acc.vidanges WHERE id_vd=$1 AND is_deleted = false`;

    db.query(sql, [id_vd], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vidange not found!" });//Emptying
        }

        return res.status(200).json(result.rows);
    });
};

exports.create = async (req, res) => {
        const { vehicule, date_vidange, km_vidange } = req.body;

        const { numparc } = vehicule;

        // 1. Récupérer l'ID du véhicule
        const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1", [numparc]);
        if (vehiculeResult.rows.length === 0) {
            return res.status(400).json({ error: "Vehicle not found!" });
        }
        const id_vehicule = vehiculeResult.rows[0].idvehicule;

        const formattedDateVidange = moment(date_vidange, 'YYYY-MM-DD').format("YYYY-MM-DD");

        const sql = `INSERT INTO acc.vidanges(id_vehicule, date_vidange, km_vidange) VALUES($1, $2, $3) RETURNING *`;

        db.query(sql, [id_vehicule, formattedDateVidange, km_vidange], (err, result) => {

            if(err) return res.status(200).json({ error: err.message });
            return res.status(200).json({ message: "vidange added Successfully", vidange: result.rows[0]})
        });

}

exports.update = async (req, res) => {

    const id_vd = Number(req.params.id_vd);
    const { vehicule, date_vidange, km_vidange } = req.body;

    const { numparc } = vehicule;

    // 1. Récupérer l'ID du véhicule
    const vehiculeResult = await db.query("SELECT idvehicule FROM acc.vehicule WHERE numparc = $1 AND is_deleted = false", [numparc]);
    if (vehiculeResult.rows.length === 0) {
        return res.status(400).json({ error: "Vehicle not found!" });
    }
    const id_vehicule = vehiculeResult.rows[0].idvehicule;

    const formattedDateVidange = moment(date_vidange, 'YYYY-MM-DD').format("YYYY-MM-DD");

    const sql = `UPDATE acc.vidanges SET id_vehicule=$1, date_vidange=$2, km_vidange=$3 WHERE id_vd=$4 RETURNING *`;

    db.query(sql, [id_vehicule, formattedDateVidange, km_vidange, id_vd], (err, result) => {
        
        if(err) return res.status(200).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "vidange not found!"});//Emptying
        }

        return res.status(200).json({ message: "vidange added Successfully", vidange: result.rows[0]})
    });

}

exports.delete = async (req, res) => {
    const id_vd = Number(req.params.id_vd);
    //const sql = `DELETE FROM acc.vidanges WHERE id_vd=$1`;
    const sql = "UPDATE acc.vidanges SET is_deleted = true WHERE id_vd = $1 RETURNING id_vd";

    db.query(sql, [id_vd], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "Vidange deleted successfully!"});
    });
};


/*exports.getAllVehicule = async (req, res)=>{

    const sql = `SELECT numparc FROM acc.vehicule`;


    db.query(sql, (err, result)=> {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vehicle not found!" });
        }

        return res.status(200).json({ vidange: result.rows[0]});
    });
}*/