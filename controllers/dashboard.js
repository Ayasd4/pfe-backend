const db = require('../db/db');

exports.countVehicle = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.vehicule WHERE is_deleted = false";
        const result = await db.query(sql);
        console.log('Total vehicles :', result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countDriver = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.chauffeur WHERE is_deleted = false";
        const result = await db.query(sql);
        console.log('Total Drivers :', result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countTechnician = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.technicien WHERE is_deleted = false";
        const result = await db.query(sql);
        console.log('Total Technician :', result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countAtelier = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.atelier WHERE is_deleted = false";
        const result = await db.query(sql);
        console.log('Total Workshops :', result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countOrders = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE is_deleted = false";
        const result = await db.query(sql);
        console.log('Total Ordres :', result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}