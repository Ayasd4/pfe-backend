const db = require("../db/db")
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

require("dotenv").config();

const nodemailer = require('nodemailer');

const authenticate = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

//const { user } = require("../routes/authentification");


exports.register = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, password, roles } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = "INSERT INTO acc.utilisateur (nom, prenom, telephone, email, password, roles) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

    db.query(sql, [nom, prenom, telephone, email, hashedPassword, roles], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({ message: "user registered successfully" });
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//const secret = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM acc.utilisateur WHERE email = $1";

    db.query(sql, [email], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      console.log("Query result:", result);
      
      if (result.rows.length === 0){ 
        return res.status(404).json({ message: "User not found!" });
      }

      const utilisateur = result.rows[0];

      // Vérifier si le mot de passe est null
      if (!utilisateur.password) {
        return res.status(400).json({ message: "Password not set!" });
      }

      // Vérifier si bcrypt.compare reçoit des arguments corrects
      console.log("Comparing password:", password, utilisateur.password);
      
      const isMatch = await bcrypt.compare(password, utilisateur.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password!" });
      }

      /*if (!await bcrypt.compare(password, utilisateur.password)) {
        return res.status(400).json({ message: "Incorrect password!" });
      }*/

      const token = jwt.sign(
        { id: utilisateur.id, email: utilisateur.email, roles: utilisateur.roles }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({ token, user: { id: utilisateur.id, nom: utilisateur.nom, roles: utilisateur.roles } });
    });

  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const sql = "SELECT id FROM acc.utilisateur WHERE email=$1";

    db.query(sql, [email], async (err, result) => {
      if (err) { return res.status(500).json({ error: err.message }); }
      
      //aucun utilisateur trouvé par adresse mail
      if (result.rows.length === 0) {
        return res.status(200).json({ message: "Email adresse not found!" }); //Message sent successfully to your email
      }

      const utilisateur = result.rows[0];

      // Générer un nouveau mot de passe temporaire
      const newPassword = crypto.randomBytes(6).toString("hex");

      // Hacher le mot de passe avant de l’enregistrer
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe en base de données
      const updateSql = "UPDATE acc.utilisateur SET password=$1 WHERE id=$2";
      db.query(updateSql, [hashedPassword, utilisateur.id], (err) => {
        if (err) return res.status(500).json({ error: "Failed to update password" });

        // Configurer l'email
        var mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Password Reset - Fleet Management",
          html: `<p><b>Your login details for fleet management</b><br>
                 <b>Email:</b> ${email}<br>
                 <b>New Password:</b> ${newPassword}<br>
                 <a href="http://localhost:4200/">Click here to login</a></p>`
        };

        // Envoyer l'email
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.status(500).json({ error: "Failed to send email" });
          } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ message: "Email sent successfully" });
          }
        });
      });
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "logout successful" });
};

exports.show = async (role, res) => {
  const sql = "SELECT id, nom, prenom, telephone, email FROM acc.utilisateur WHERE roles=$1";
  db.query(sql, [role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json(result.rows);  // Retourne les utilisateurs correspondant au rôle
  });
};

exports.updateUser = async (req, res) => {//(userId, data, res)
  try {
    const userId = req.params.id;  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
    const { nom, prenom, telephone, email, password } = req.body;  // Récupère les nouvelles données

    // Si un mot de passe est fourni, on le hash avant de l'enregistrer
    //let updatedData = { ...data };
    let updatedData = { nom, prenom, telephone, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(data.password, salt);
    }

    // Crée la requête SQL pour mettre à jour l'utilisateur
    const sql = `
      UPDATE acc.utilisateur
      SET nom = $1, prenom = $2, telephone = $3, email = $4, password = $5
      WHERE id = $6
      RETURNING id, nom, prenom, telephone, email
    `;

    // Effectue la mise à jour dans la base de données
    db.query(sql, [
      updatedData.nom,
      updatedData.prenom,
      updatedData.telephone,
      updatedData.email,
      updatedData.password || null,  // Si aucun mot de passe n'est fourni, on ne le met pas à jour
      userId
    ], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkToken = async (req, res) => {
  return res.status(200).json({ message: true });
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.utilisateur.email; // Récupérer l'email à partir de req.user (assurez-vous que authMiddleware le définit)

    console.log("Email from authenticated user:", req.utilisateur.email);

    // Vérifier si l'utilisateur existe et récupérer son mot de passe
    const sqlSelect = "SELECT * FROM acc.utilisateur WHERE email=$1";
    db.query(sqlSelect, [email], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const hashedPassword = result.rows[0].password;

      //console.log(result);
      //console.log(result.rows[0].password);

      // Vérifier si l'ancien mot de passe est correct
      const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }

      console.log("Hashed password from DB:", hashedPassword);


      // Hasher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le mot de passe dans la base de données
      const sqlUpdate = "UPDATE acc.utilisateur SET password=$1 WHERE email=$2";
      db.query(sqlUpdate, [hashedNewPassword, email], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({ message: "Password updated successfully" });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};




















/*exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM acc.utilisateur WHERE email = $1";

    db.query(sql, [email], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.rows.length === 0) return res.status(404).json({ message: "User not found!" });

      const utilisateur = result.rows[0];

      if (!await bcrypt.compare(password, utilisateur.password)) {
        return res.status(400).json({ message: "Incorrect password!" });
      }

      /*const token = jwt.sign(
              { id: user.id, email: user.email, roles: user.roles },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          res.json({ token, user: { id: user.id, nom: user.nom, roles: user.roles } }); 

          const token = jwt.sign({ id: utilisateur.id, roles: utilisateur.roles }, "secret", { expiresIn: "1d" });

          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
          });
    
          res.status(200).json({ message: "Connection successful", token });
        });
    
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }; */


/*var mailOptions = {
  from: process.env.EMAIL,
  to: email,//utilisateur.email,//sdiriaya488@mailinator.com'
  subject:  'test email', //'Password de gestion de flotte'
  html: `<p><b>Your login details for fleet management</b><br>
         <b>Email:</b> ${utilisateur.email}<br>
         <b>Password:</b> ${utilisateur.password}<br>
         <a href="http://localhost:4200/">Click here to login</a></p>`
};*/
