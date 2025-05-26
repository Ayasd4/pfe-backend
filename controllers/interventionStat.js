const db = require('../db/db');

exports.electStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier électrique']);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

exports.mecanStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier mécanique']);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

exports.volcaStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier volcanisation']);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

exports.moteurStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier moteur']);

        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

exports.tolerieStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier tolerie']);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

exports.prevStat = async (req, res) => {
    try {
        const sql = `SELECT a.nom_atelier AS atelier,
        count(i.id_intervention) AS total_intervention
        FROM acc.intervention AS i 
        JOIN acc.atelier AS a ON i.id_atelier = a.id_atelier AND a.is_deleted= false
        WHERE a.nom_atelier = $1 AND i.is_deleted = false
        GROUP BY a.nom_atelier`;

        const result = await db.query(sql, ['atelier préventive']);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}