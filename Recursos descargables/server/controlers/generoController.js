let con = require('../lib/conexionbd');

function competenciaPorGenero(req, res) {
    let pedido = "SELECT * FROM genero";
    con.query(pedido, function(error, resultado, fields) {
        if (error) {
            console.log("Error al cargar géneros", error.message);
            return res.status(500).send(error);
        }
        res.send(JSON.stringify(resultado));
    });
}

module.exports = {
    competenciaPorGenero: competenciaPorGenero
};