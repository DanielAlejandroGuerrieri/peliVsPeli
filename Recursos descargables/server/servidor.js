//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var competenciasController = require('./controlers/competenciasController');

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

app.get('/generos', competenciasController.competenciaPorGenero); //

app.get('/directores', competenciasController.competenciaPorDirectores); //

app.get('/actores', competenciasController.competenciaPorActores); //

app.put('/competencias/:id', competenciasController.editarCompetencia);

app.delete('/competencias/:idCompetencia', competenciasController.eliminarCompetencia);



//puerto en el cual va a escuchar los pedidos
var puerto = '8080';

app.listen(puerto, function() {
    console.log("Escuchando en el puerto " + puerto);
});