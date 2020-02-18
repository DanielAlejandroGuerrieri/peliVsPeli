let con = require('../lib/conexionbd');


function competenciaPorDirectores(req, res) {
    let pedido = "SELECT * FROM director";
    con.query(pedido, function(error, resultado, fields) {
        if (error) {
            console.log("Error al cargar directores", error.message);
            return res.status(500).send(error);
        }
        res.send(JSON.stringify(resultado));
    });
}

module.exports = {
    competenciaPorDirectores: competenciaPorDirectores
};