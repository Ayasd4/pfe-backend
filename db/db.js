const { Pool } = require('pg'); // Importer Pool depuis pg

// Créer une instance de Pool avec tes paramètres de connexion

// Créer une instance de Pool avec tes paramètres de connexion

// base de données local
/*const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "0000",        
    database: "flotte" 
});*/

//base de données en ligne

const pool = new Pool({
  connectionString: 'postgresql://dernier_flotte_owner:npg_9rfCDcXbL8ny@ep-misty-bread-a8n6hkjk-pooler.eastus2.azure.neon.tech/dernier_flotte?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});


// Tester la connexion
pool.connect((err, connection) => {
  if (err) throw err;
  console.log("Connected to PostgreSQL successfully");
  connection.release(); // Libérer la connexion après utilisation
});

module.exports = pool; // Exporter pool pour l'utiliser ailleurs dans ton projet