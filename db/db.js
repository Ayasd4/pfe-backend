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


//connectionString: 'postgresql://neondb_owner:npg_w7lbz2kCsouh@ep-shrill-flower-a46zz03f-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',

//base de données en ligne
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_w7lbz2kCsouh@ep-green-sun-a45pxs2v-pooler.us-east-1.aws.neon.tech/gestion%20de%20flotte?sslmode=require',
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