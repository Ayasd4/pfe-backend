const db = require("../db/db");


exports.create = async (req, res) => {
    const { nom, prenom, email, password, roles } = req.body;
    const sql = "INSERT INTO acc.admin (nom, prenom, email, password, roles) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    
    try {
        const result = await db.query(sql, [nom, prenom, email, password, roles]);
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating admin", error: err });
    }
};

exports.list = async(req, res) => {
    const sql = "SELECT * FROM acc.admin";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erreur lors de l'exécution de la requête:", err);  // Log de l'erreur
            return res.status(500).json(err);
        }
        return res.status(200).json(result.rows);
    });
}


exports.show = async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM acc.admin WHERE id = $1";
    try {
        const result = await db.query(sql, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching admin", error: err });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password, roles } = req.body;
    const sql = "UPDATE acc.admin SET nom = $1, prenom = $2, email = $3, password = $4, roles=$5 WHERE id = $6 RETURNING *";
    try {
        const result = await db.query(sql, [nom, prenom, email, password,roles, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating admin", error: err });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM acc.admin WHERE id = $1 RETURNING *";
    try {
        const result = await db.query(sql, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json({ message: "Admin deleted successfully", deletedAdmin: result.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting admin", error: err });
    }
};

/*exports.create = async(req, res) => {
    const { nom, prenom, email, password } = req.body;
    const sql = "INSERT INTO acc.admin (nom, prenom, email, password) VALUES ($1, $2, $3, $4) RETURNING *";
    
    db.query(sql, [nom, prenom, email, password], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(201).json(result.rows[0]);
    });
}

exports.list = async(req, res) => {
    const sql = "SELECT * FROM acc.admin";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(result.rows);
    });
}

exports.show = async(req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password } = req.body;
    const sql = "UPDATE acc.admin SET nom = $1, prenom = $2, email = $3, password = $4 WHERE id = $5 RETURNING *";
    
    db.query(sql, [nom, prenom, email, password, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compte non trouvé" });
        }
        return res.status(200).json(result.rows[0]);
    });
}

exports.update = async(req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password } = req.body;
    const sql = "UPDATE acc.admin SET nom = $1, prenom = $2, email = $3, password = $4 WHERE id = $5 RETURNING *";
    
    db.query(sql, [nom, prenom, email, password, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compte non trouvé" });
        }
        return res.status(200).json(result.rows[0]);
    });
}


exports.delete = async(req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM acc.admin WHERE id = $1 RETURNING *";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compte non trouvé" });
        }
        return res.status(200).json({ message: "Compte supprimé avec succès", deletedAdmin: result.rows[0] });
    });
}
*/