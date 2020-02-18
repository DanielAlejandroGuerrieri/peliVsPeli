let con = require('../lib/conexionbd');

function competenciaPorActores(req, res) {
    let pedido = "SELECT * FROM actor";
    con.query(pedido, function(error, resultado, fields) {
        if (error) {
            console.log("Error al cargar actores", error.message);
            return res.status(500).send(error);
        }
        res.send(JSON.stringify(resultado));
    });
}

module.exports = {
    competenciaPorActores: competenciaPorActores
};