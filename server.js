const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');


require("dotenv").config();


const bodyParser = require("body-parser");
const port = process.env.PORT || 3100;

const vehiculeRouter = require('./routes/vehicule');
const utilisateurRouter =  require('./routes/utilisateur');
const authentificationRouter = require("./routes/authentification");
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth'); 
const chauffeurRouter = require('./routes/chauffeur');
const demandesRouter = require('./routes/demandes');
const numparcRouter = require('./routes/getAllNumparc');
const nameRouter = require('./routes/getAllName');
const statutRouter = require('./routes/updateStatus');
const atelierRouter = require('./routes/atelier');
const maintenanceRouter = require('./routes/maintenance');
const diagnosticRouter = require('./routes/diagnostic');
const getdemandeRouter = require('./routes/getDemandeById');
const technicienRouter = require('./routes/technicien');
const ordreRouter = require('./routes/ordre');
const travauxRouter = require('./routes/travaux');
const infosRouter = require('./routes/getInfoOrdre');
const interventionRouter = require('./routes/intervention');
const infosIntervRouter = require('./routes/getInfoIntervention');
const getordreRouter = require("./routes/getOrdreById");
const getdetailsRouter = require("./routes/detailsOrder");
const uploadsRouter = require('./routes/uploads');
const generateRouter = require('./routes/generateAllDemande');
const agenceRouter = require('./routes/agence');
const consomationCarbRouter = require('./routes/consomationCarb');
const kilometrageRouter = require('./routes/kilometrage');
const vidangeRouter = require('./routes/vidanges');
const etatVdRouter = require('./routes/etat_vidange');
const dashboardRouter = require('./routes/dashboard');
const dispoRouter = require('./routes/disponibilite');
const ordreStatRouter = require('./routes/ordreStat');
const conStatistiqueRoutes = require('./routes/conStatistique');
const intervByOrdreRoutes = require("./routes/getIntervByOrdre");
const intervStatRoutes = require("./routes/interventionStat");

// Créer le serveur Node.js
app.use(bodyParser.json());
app.use(express.json());

app.use(cookieParser());

app.use(cors());

//all origins
app.get('/', (req, res)=>{
    res.send('CORS enabled for all origins');
});


/*app.use(cors(
    {
        credentials: true,
        origin: ["http://localhost:3100","http://localhost:8080", "http://localhost:4200", "http://localhost:8100", "http://192.168.1.104:3100"]
    }
));*/

app.use('/vehicules', vehiculeRouter);
app.use('/utilisateur', utilisateurRouter);
app.use('/authentification', authentificationRouter);
app.use('/admins', adminRouter);
app.use('/adminn', authRouter);
app.use('/chauffeur',chauffeurRouter);
app.use('/demandes', demandesRouter);
app.use('/getAllNumparc', numparcRouter);
app.use('/getAllName', nameRouter);
app.use('/updateStatus', statutRouter);
app.use('/atelier', atelierRouter);
app.use('/getDemandes', maintenanceRouter);
app.use('/diagnostic', diagnosticRouter);
app.use('/getDemandeById', getdemandeRouter);
app.use('/technicien', technicienRouter);
app.use('/ordre', ordreRouter);
app.use('/travaux', travauxRouter);
app.use('/infos', infosRouter);
app.use('/intervention', interventionRouter);
app.use('/infosIntervention', infosIntervRouter);
app.use('/getOrdreById', getordreRouter);
app.use('/list-uploads', uploadsRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/genrateAllDemandes', generateRouter);
app.use('/agence',agenceRouter);
app.use('/consomation', consomationCarbRouter);
app.use('/kilometrage', kilometrageRouter);
app.use('/vidanges', vidangeRouter);
app.use('/etatVidange', etatVdRouter);
app.use('/dashboard', dashboardRouter);
app.use('/disponibilite', dispoRouter);
app.use('/ordreStat', ordreStatRouter);
app.use('/statistiques', conStatistiqueRoutes);
app.use('/getDetailsOrder', getdetailsRouter);
app.use('/intervByOrdre', intervByOrdreRoutes);
app.use('/intervStat', intervStatRoutes);


app.listen(port, () => {
    //if (err) throw err;
    console.log(`Server is now listening at port: ${port}`);
});
