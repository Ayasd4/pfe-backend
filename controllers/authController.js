const db = require("../db/db");

const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

require("dotenv").config();


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM acc.admin WHERE email = $1";

    db.query(sql, [email], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      console.log("Query result:", result);
      
      if (result.rows.length === 0){ 
        return res.status(404).json({ message: "Admin not found!" });
      }

      const adminn = result.rows[0];

      // Vérifier si le mot de passe est null
      if (!adminn.password) {
        return res.status(400).json({ message: "Password not set!" });
      }

      // Vérifier si bcrypt.compare reçoit des arguments corrects
      console.log("Comparing password:", password, adminn.password);
      
      const isMatch = await bcrypt.compare(password, adminn.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password!" });
      }

      const token = jwt.sign(
        { id: adminn.id, email: adminn.email, roles: adminn.roles }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({ token, adminn: { id: adminn.id, nom: adminn.nom, roles: adminn.roles } });
    });

  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "logout successful" });
};


exports.updateAdmin = async (req, res) => {//(userId, data, res)
  try {
    const adminId = req.params.id;  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
    const { nom, prenom, email, password } = req.body;  // Récupère les nouvelles données

    // Si un mot de passe est fourni, on le hash avant de l'enregistrer
    //let updatedData = { ...data };
    let updatedData = { nom, prenom, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    // Crée la requête SQL pour mettre à jour l'admin
    const sql = `
      UPDATE acc.admin
      SET nom = $1, prenom = $2, email = $3, password = $4
      WHERE id = $5
      RETURNING id, nom, prenom, email
    `;

    // Effectue la mise à jour dans la base de données
    db.query(sql, [
      updatedData.nom,
      updatedData.prenom,
      updatedData.email,
      updatedData.password || null,  // Si aucun mot de passe n'est fourni, on ne le met pas à jour
      adminId
    ], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "admin not found." });
      }

      return res.status(200).json({ message: "admin updated successfully", admin: result.rows[0] });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkToken = async (req, res) => {
  return res.status(200).json({ message: true });
};
