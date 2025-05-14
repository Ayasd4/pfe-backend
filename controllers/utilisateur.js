const db = require("../db/db");
const bcrypt = require("bcryptjs");

//ajouter un utilisateur avec hachage de mdp
exports.create = async (req, res) => {
    try {
        const { nom, prenom, telephone, email, password, roles } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO acc.utilisateur (nom, prenom, telephone, email, password, roles) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

        db.query(sql, [nom, prenom, telephone, email, hashedPassword, roles], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(201).json(result.rows[0]);
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

//  Récupérer la liste des utilisateurs (sans mot de passe)
exports.list = async (req, res) => {
    const sql = "SELECT id, nom, prenom, telephone, email, roles FROM acc.utilisateur";//    const sql = "SELECT * FROM acc.utilisateur";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(result.rows);
    });
}

//  Récupérer un utilisateur spécifique (sans mot de passe)
exports.show = async (req, res) => {
    const valueId = Number(req.params.id);
    const sql = "SELECT id, nom, prenom, telephone, email, roles FROM acc.utilisateur where id=$1"; // select * from
    db.query(sql, [valueId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json(result.rows);
    });
}


// Mettre à jour un utilisateur (avec hachage du mot de passe)
exports.update = async (req, res) => {
    const { id } = req.params;
    let { nom, prenom, telephone, email, password, roles } = req.body;

    let hashedPassword = password;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const sql = "UPDATE acc.utilisateur SET nom = $1, prenom = $2, telephone = $3, email = $4, password = COALESCE($5, password), roles = $6 WHERE id = $7 RETURNING id, nom, prenom, telephone, email, roles";

    db.query(sql, [nom, prenom, telephone, email, hashedPassword, roles, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "compte non trouvé" });
        }
        return res.status(200).json({ message:"user updated successfully" , user: result.rows[0]});
    });
};



exports.delete = async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM acc.utilisateur WHERE id = $1 RETURNING id, nom, prenom, email";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json({ message: "User deleted successfully", deletedutilisateur: result.rows[0] });
    });
}
