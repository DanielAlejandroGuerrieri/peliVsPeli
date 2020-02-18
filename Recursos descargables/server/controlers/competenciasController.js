let con = require('../lib/conexionbd');

function listarCompetencias(req, res) {

    let sql = "select * from competencia";

    con.query(sql, function(error, competencia, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(competencia));
    });
}


function obtenerCompetenciaEntreDosPeliculas(req, res) {

    let idCompetencia = req.params.id; // toma el id de la competencia a la cual se hace el click

    let sqlCompetencia = "select * from competencia where id = " + idCompetencia;


    con.query(sqlCompetencia, function(error, competencia, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        var query = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
        var genero = competencia[0].genero_id;
        var actor = competencia[0].actor_id;
        var director = competencia[0].director_id;
        var queryGenero = genero ? ' AND pelicula.genero_id = ' + genero : '';
        var queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
        var queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
        var randomOrder = ' ORDER BY RAND() LIMIT 2';

        var sqlPelicula = query + queryGenero + queryActor + queryDirector + randomOrder;

        con.query(sqlPelicula, function(error, peliculas, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
            let response = {
                'competencia': competencia[0].nombre,
                'peliculas': peliculas
            };
            res.send(JSON.stringify(response));

        });

    });
}


function votoPelicula(req, res) {
    let idCompetencia = req.params.idCompetencia;
    let idPelicula = req.body.idPelicula;
    console.log(req);
    let sql = "INSERT INTO voto ( pelicula_id , competencia_id) values (" + idPelicula + ", " + idCompetencia + ")";

    con.query(sql, function(error, resultado, fields) {

        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }
        let response = {
            'voto': resultado.insertId,
        };
        res.status(200).send(response);
    });
}

function eliminarVotos(req, res) {
    let idCompetencia = req.params.id;
    let eliminar = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;

    con.query(eliminar, function(error, resultado, fields) {
        if (error) {
            console.log("Error al eliminar votos", error.message);
            return res.status(500).send(error);
        }
        console.log("Competencia reiniciada id: " + idCompetencia);
        res.send(JSON.stringify(resultado));
    });

}

function cargarResultados(req, res) {
    let idCompetencia = req.params.id;
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;

    con.query(sql, function(error, resultado) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        let competencia = resultado[0];

        let sql = "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " + idCompetencia + " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3";

        con.query(sql, function(error, resultado) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            let response = {
                'competencia': competencia.nombre,
                'resultados': resultado
            };

            res.send(JSON.stringify(response));
        });
    });
}

function crearCompetencia(req, res) {
    let nombreCompetencia = req.body.nombre;
    let generoCompetencia = req.body.genero === '0' ? null : req.body.genero;
    let directorCompetencia = req.body.director === '0' ? null : req.body.director;
    let actorCompetencia = req.body.actor === '0' ? null : req.body.actor;

    if (!nombreCompetencia) { //comprobacion si existe el texto en el body
        console.log('No esta definida la competencia');
        return res.status(422).send("Falta definir la competencia");
    }

    let queryCompetencia = 'select * from competencia where nombre like "%' + nombreCompetencia + '%"';

    con.query(queryCompetencia, function(error, competencia, fields) {
        if (error) {
            console.log("Hubo un error en la conexion", error.message);
            return res.status(500).send("Hubo un error en la conexion");
        }
        if (competencia.length !== 0) {
            console.log('La competencia ya existe');
            return res.status(422).send("Ya existe una competencia con ese nombre");
        }

        let queryPelicula = 'select count(*) as cantidad from pelicula p left join director_pelicula dp on (p.id = dp.pelicula_id) left join actor_pelicula ap on (p.id = ap.pelicula_id) where true';

        if (generoCompetencia) {
            queryPelicula += ' and genero_id = ' + generoCompetencia + '';
        }
        if (directorCompetencia) {
            queryPelicula += ' and director_id = ' + directorCompetencia + '';
        }
        if (actorCompetencia) {
            queryPelicula += ' and actor_id = ' + actorCompetencia + '';
        }

        con.query(queryPelicula, function(error, cantidad, fields) {
            if (error) {
                console.log("Hubo un error en la conexion", error.message);
                return res.status(500).send('Hubo un error en la consulta de la tabla peliculas');
            }

            if (cantidad[0].cantidad <= 1) {
                return res.status(422).send('No se puede crear la competencia, ya que no hay peliculas suficientes');
            }

            let sql = "INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES ('" + nombreCompetencia + "', " + generoCompetencia + ", " + directorCompetencia + ", " + actorCompetencia + ");";

            con.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error al crear la competencia", error.message);
                    return res.status(500).send("Hubo un error al crear la competencia");
                }
                res.send(JSON.stringify(resultado));
            });
        });
    });
}


function obtenerNombre(req, res) {
    let nombreCompetencia = req.params.id;

    let query = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " + nombreCompetencia;

    con.query(query, function(error, resultado, fields) {
        if (error) {
            console.log("Error de consulta: ", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        let response = {
            'id': resultado,
            'nombre': resultado[0].nombre,
            'genero_nombre': resultado[0].genero,
            'actor_nombre': resultado[0].actor,
            'director_nombre': resultado[0].director
        }
        res.send(JSON.stringify(response));
    });
}

function eliminarCompetencia(req, res) {
    let idCompetencia = req.params.idCompetencia;
    let borrar = "DELETE FROM competencia WHERE id =" + idCompetencia;

    con.query(borrar, function(error, resultado) {
        if (error) {
            console.log("Error al eliminar la competencia", error.message);
            return res.status(500).send("Error al eliminar competencia");
        }
        res.send(JSON.stringify(resultado));
    });
}


function editarCompetencia(req, res) {
    let idCompetencia = req.params.id;
    let nuevoNombre = req.body.nombre;

    let sql = "UPDATE competencia SET nombre = '" + nuevoNombre + "' WHERE id = " + idCompetencia + ";";

    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Error de consulta: ", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        if (resultado.length == 0) {
            console.log("No se encontro la pelicula buscada con ese id");
            return res.status(404).send("No se encontro ninguna pelicula con ese id");
        } else {
            var response = {
                'id': resultado
            };
        }

        res.send(JSON.stringify(response));
    });

}


module.exports = {
    listarCompetencias: listarCompetencias,
    obtenerCompetenciaEntreDosPeliculas: obtenerCompetenciaEntreDosPeliculas,
    votoPelicula: votoPelicula,
    eliminarVotos: eliminarVotos,
    cargarResultados: cargarResultados,
    crearCompetencia: crearCompetencia,
    obtenerNombre: obtenerNombre,
    eliminarCompetencia: eliminarCompetencia,
    editarCompetencia: editarCompetencia
}