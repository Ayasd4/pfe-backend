const db = require("../db/db");

exports.getDemandeById = async (req, res) => {
    const id_demande = req.params.id_demande;

    if (!id_demande) {
        return res.status(400).json({ error: "id_demande is required" });
    }
    //sql= "SELECT * FROM acc.demandes WHERE id_demande=$1" // WHERE id_demande=$1

    sql = `SELECT d.type_avarie,
    d.description,
    v.numparc
    FROM acc.demandes AS d
    JOIN acc.vehicule AS v ON d.id_vehicule = v.idvehicule
    WHERE id_demande=$1
    `;

    db.query(sql, [id_demande], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows[0]);
    });
}





/*exports.getDemande= async (req, res) =>{
    //const { id_demande} = Number(req.params.id_demande)
    sql= "SELECT id_demande From acc.demandes" // WHERE id_demande=$1

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
} */