const db = require("../db/db");

exports.update = async (req, res)=>{
    const id_demande = Number(req.params.id_demande);
    const {statut} = req.body;

    sql= "UPDATE acc.demandes SET statut=$1 WHERE id_demande=$2";

    db.query(sql, [statut, id_demande], (err, result)=>{
        if (err) res.status(500).json({error: err.message});
        res.status(200).json({ message: "status updated successfully!", demande: result.rows});
    });
}