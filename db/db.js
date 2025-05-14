const { Pool } = require('pg'); // Importer Pool depuis pg

// Créer une instance de Pool avec tes paramètres de connexion
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "0000",        
    database: "flotte" 
});

// Tester la connexion
pool.connect((err, connection) => {
    if (err) throw err;
    console.log("Connected to PostgreSQL successfully");
    connection.release(); // Libérer la connexion après utilisation
});

module.exports = pool; // Exporter pool pour l'utiliser ailleurs dans ton projet