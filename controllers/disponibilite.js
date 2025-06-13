const db = require("../db/db");

exports.vehiculeEnService = async (req, res) => {
    try {
        const sql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const result = await db.query(sql, ['en_service']);
        return res.status(200).json({ total: result.rows[0].total });
    } catch (error) {
        console.error('Erreur en comptant les véhicules en service:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

exports.vehiculeEnMaintenance = async (req, res) => {
    try {
        const sql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const result = await db.query(sql, ['en_maintenance']);
        return res.status(200).json({ total: result.rows[0].total });
    } catch (error) {
        console.error('Erreur en comptant les véhicules en maintenance:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

exports.vehiculeEnPanne = async (req, res) => {
    try {
        const sql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const result = await db.query(sql, ['en_panne']);
        return res.status(200).json({ total: result.rows[0].total });
    } catch (error) {
        console.error('Erreur en comptant les véhicules en panne:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

exports.dispoVehiculeEnService = async (req, res) => {
    try {
        const enServiceSql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const totalSql = "SELECT COUNT(*) AS total FROM acc.vehicule WHERE is_deleted= false";

        const resultEnServiceSql = await db.query(enServiceSql, ['en_service']);
        const resultTotalSql = await db.query(totalSql);

        const total = parseInt(resultTotalSql.rows[0].total);
        const enService = parseInt(resultEnServiceSql.rows[0].total);

        const disponibilite = total > 0 ? ((enService / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

exports.dispoVehiculeEnMaintenance = async (req, res) => {
    try {
        const enMaintSql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const totalSql = "SELECT COUNT(*) AS total FROM acc.vehicule WHERE is_deleted= false";

        const resultEnMaintSql = await db.query(enMaintSql, ['en_maintenance']);
        const resultTotalSql = await db.query(totalSql);

        const total = parseInt(resultTotalSql.rows[0].total);
        const enMaint = parseInt(resultEnMaintSql.rows[0].total);

        const disponibilite = total > 0 ? ((enMaint / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

exports.dispoVehiculeEnPanne = async (req, res) => {
    try {
        const enPanneSql = `SELECT COUNT(*) AS total FROM acc.vehicule WHERE etat = $1 AND is_deleted= false`;
        const totalSql = "SELECT COUNT(*) AS total FROM acc.vehicule WHERE is_deleted= false";

        const resultEnPanneSql = await db.query(enPanneSql, ['en_panne']);
        const resultTotalSql = await db.query(totalSql);

        const total = parseInt(resultTotalSql.rows[0].total);
        const enPanne = parseInt(resultEnPanneSql.rows[0].total);

        const disponibilite = total > 0 ? ((enPanne / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}