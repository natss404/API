const express = require("express"); //---> llamamos al modulo de express
const app = express(); //---> instanciamos el objeto principal "app" de nuest5ra API
app.use(express.urlencoded({ extended: true })); //---> analiza las peticiones https://expressjs.com/es/api.html#express.urlencoded
app.use(express.json()); //---> middleware que solo analiza json  https://expressjs.com/es/api.html#express.json
// especificamos constantes de conexion en el servidor
const PORT = 3000
app.listen(PORT, () => { //---> Vincula y escucha las conexiones en el host y el puerto especificados. Este método es idéntico al http.Server.listen () de Node.
  console.log(`server run on port: ${PORT}`);
});

//---> MongoDB
const mongoose = require("mongoose");//---> llamamos al modulo de mongoose para administrar mongodb

// especificamos constantes de conexion a la DB:
const DB = 'farmacia';
const DB_PORT = 27017;

mongoose.connection.openUri( //---> especificamos los parametros de conexion a la DB
  `mongodb://localhost:${DB_PORT}/${DB}`, //---> url de nuestra DB
  {useNewUrlParser: true, useUnifiedTopology: true}, //---> configuraciones de mongoose
  (err, res) => { 
    if (err) { //---> si hubo algun error al conectarse a la url de la DB termina la ajecucion y devulve un error
      return res.status(500).json({
        ok: false,
        message: "error al conectarse a la base de datos",
        errors: err,
      });
    }
    console.log(`Mongo server run on port: ${DB_PORT}`);
  }
);

 //---> creamos nuestro modelos de datos a partir de la "interfaz" y el schema de mongo

 var personal = mongoose.Schema; //---> instanciamos un Schema de mongo 
const personalSchema = new personal( //---> creamos la "interfaz" a partir del esquema de datos con el cual trabajaremos
  {
    nombre: { //---> a cada campo con el que trabajaremos se le pueden asignar reglas
      type: String, //---> aqui decimos que sera un String
      required: [true, "El nombre es necesario"], //---> aqui especificamos que el campo es requerido de lo contrario el POST se rechaza
    },
    apellido: {
      type: String,
      required: [true, "El apellido es necesario"],
    },
   
    ci: {
      type: String,
      required: [true, "El nit o ci es necesario"],
    },
  },
  {
    collection: "Personal", //---> indicamos la coleccion con la que trabajaremos
  }
);
personalModel = mongoose.model("personal", personalSchema); //---> creamos nuestro modelos de datos a partir de la "interfaz" y el schema de mongo

app.get("/", function (req, res) { //---> Peticion de prueba
  res.status(200).json({
    ok: true,
    message: "peticion realizada exitosamente",
  });
});

app.get("/Personal", function (req, res) { //---> lista de clientes
  personalModel.find(
    {}, //---> filtro de la consulta ex: { name: "ricardo"}
    "_id nombre apellido ci", //---> limitamos los parametros a recibir
    (err, Personal) => { //---> callback
      if (err) { //---> respuesta si la consulta no se ejecuto bien
        return res.status(500).json({
          ok: false,
          message: "error al buscar al personal",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        Personal: Personal
      });
  });
});

app.get("/Personal/:id", function (req, res) { //---> buscamos un cliente por su _id
  const id = req.params.id; //---> obtenemos el _id desde la url
  if (!id) {
    res.status(400).json({
      ok: false,
      message: "error al recibir el id",
    });
  }
 //Buscar personal por su id 

  personalModel.findById(id, (err, Personal) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "error al buscar el personal",
        errors: err,
      });
    }
    if (!Personal) {
      return res.status(204).json({
        ok: true,
        message: "No se encontro al empleado"
      });
    }
    res.status(200).json({
      ok: true,
      Personal: Personal,
    });
  });
});
//guardar un nuevo empleado
app.post("/Personal", (req, res) => {
  const dataRecibida = req.body; //---> obtenemos los datos enviados por el clinte desde su peticion
  if (!dataRecibida) {
    res.status(400).json({
      ok: false,
      message: "error al recibir los datos",
    });
  }
  const persona = new personalModel({ //---> Creamos un modelo de datos con los datos recibidos en la peticion
    nombre: dataRecibida.nombre,
    apellido: dataRecibida.apellido,
    ci: dataRecibida.ci,

  });
  persona.save((err, newpersonal) => { //---> guardamos el modelo
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "error al guardar personal",
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      message: "Nuevo empleado guardado",
      newpersonal: newpersonal,
    });
  });
});

app.put("/Personal/:id", (req, res) => { //---> peticion para actualizar un usuario por su _id

  const id = req.params.id;
  const dataRecibida = req.body;

  if (!dataRecibida || !id) {
    res.status(400).json({
      ok: false,
      message: "error al recibir los datos o el id",
    });
  }
  personalModel.findById(id, (err, Personal) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "error al buscar el personal",
        errors: err,
      });
    }
    if (!Personal) {
      return res.status(204).json({
        ok: false,
        message: "empleado no encontrado",
        errors: err,
      });
    }
    Personal.nombre = dataRecibida.nombre? dataRecibida.nombre : Personal.nombre;
    Personal.apellido = dataRecibida.apellido? dataRecibida.apellido: Personal.apellido;
    Personal.ci = dataRecibida.ci? dataRecibida.ci : Personal.ci;

    Personal.save((err, newpersonal) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "error al guardar el personal",
          errors: err,
        });
      }
      res.status(201).json({
        ok: true,
        message: "Empleado actualizado",
        newpersonal: newpersonal,
      });
    });
  });
});

app.delete("/Personal/:id", (req, res) => { //---> peticion para eliminar cliente segun su _id
  const id = req.params.id;
  if (!id) {
    res.status(400).json({
      ok: false,
      message: "error al recibir el id",
    });
  }
  personalModel.findByIdAndDelete(id, (err, userErased) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "error al eliminar al empleado",
        errors: err,
      });
    }
    if (!userErased) {
      return res.status(204).json({
        ok: false,
        message: `no existe un empleado con el id: ${id}`,
        errors: err,
      });
    }
    res.status(200).json({
      ok: true,
      message: `empleado eliminado con exito`,
      user: userErased,
    });
  });
});