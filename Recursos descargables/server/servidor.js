//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var competenciasController = require('./controlers/competenciasController');
var actoresController = require('./controlers/actoresController');
var generoController = require('./controlers/generoController');
var directoresController = require('./controlers/directoresController');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


//Obtener la lista de competencias desde la base de datos
app.get('/competencias', competenciasController.listarCompetencias); //

app.get('/competencias/:id', competenciasController.obtenerNombre); //

app.post('/competencias', competenciasController.crearCompetencia); //

app.get('/competencias/:id/peliculas', competenciasController.obtenerCompetenciaEntreDosPeliculas);

app.get('/competencias/:id/resultados', competenciasController.cargarResultados); //

app.post('/competencias/:idCompetencia/voto', competenciasController.votoPelicula); //

app.delete('/competencias/:id/votos', competenciasController.eliminarVotos); //

app.get('/generos', generoController.competenciaPorGenero); //

app.get('/directores', directoresController.competenciaPorDirectores); //

app.get('/actores', actoresController.competenciaPorActores); //

app.put('/competencias/:id', competenciasController.editarCompetencia);

app.delete('/competencias/:idCompetencia', competenciasController.eliminarCompetencia);



//puerto en el cual va a escuchar los pedidos
var puerto = '8080';

app.listen(puerto, function() {
    console.log("Escuchando en el puerto " + puerto);
});