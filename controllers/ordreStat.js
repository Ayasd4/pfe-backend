const db = require('../db/db');

exports.countOrdreOuvert = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const result = await db.query(sql, ['Ouvert']);
        console.log("total open order", result.rows[0].total);
        return res.status(200).json({ total: result.rows[0].total});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countOrdreEnCours = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const result = await db.query(sql, ['En cours']);
        return res.status(200).json({ total: result.rows[0].total});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.countOrdreFermé = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const result = await db.query(sql, ['Fermé']);
        return res.status(200).json({ total: result.rows[0].total});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.dispoOrderOuvert = async (req, res) =>{
    try {
        
        const ouvertSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const totalSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE is_deleted= false";

        const resultOuvertSql = await db.query(ouvertSql, ['Ouvert']);
        const resultTotalSql = await db.query(totalSql);

        const ouvert = parseInt(resultOuvertSql.rows[0].total);
        const total = parseInt(resultTotalSql.rows[0].total);

        const disponibilite = total > 0 ? ((ouvert / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Error server' });
    }
}

exports.dispoOrderEnCours = async (req, res) =>{
    try {
        
        const enCoursSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const totalSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE is_deleted= false";

        const resultEnCoursSql = await db.query(enCoursSql, ['En cours']);
        const resultTotalSql = await db.query(totalSql);

        const enCours = parseInt(resultEnCoursSql.rows[0].total);
        const total = parseInt(resultTotalSql.rows[0].total);

        const disponibilite = total > 0 ? ((enCours / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Error server' });
    }
}

exports.dispoOrderFermé = async (req, res) =>{
    try {
        
        const fermeSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE status= $1 AND is_deleted= false";
        const totalSql = "SELECT COUNT(*) AS total FROM acc.ordre_travail WHERE is_deleted= false";

        const resultFermeSql = await db.query(fermeSql, ['Fermé']);
        const resultTotalSql = await db.query(totalSql);

        const ferme = parseInt(resultFermeSql.rows[0].total);
        const total = parseInt(resultTotalSql.rows[0].total);

        const disponibilite = total > 0 ? ((ferme / total) * 100).toFixed(2) : 0;

        return res.status(200).json({ disponibilite: `${disponibilite}%` });

    } catch (error) {
        console.error('Erreur en calculant la disponibilité:', error);
        return res.status(500).json({ error: 'Error server' });
    }
}