const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const database = require('./database');

// Initializations

const app = express();
const SECRET_JWT_KEY = 'pobrecitalayang';

// Settings 
app.set('port', process.env.PORT || 4000);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
    res.send("Hola Hippie qlo")
});

// app.get('/eventos', async (req, res) => {
//     try {
//         const collection = database.collection('peliculas');
//         collection.find({}).toArray(function (err, result) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 console.log("Query exitosa a la db, eventos enviados");
//                 res.json({
//                     eventos: result,
//                 });
//                 return;
//             }
//         })
//     } finally {
//         console.log("Error en la query");
//     }
// });

function loginByToken(req) {
    const token = req.headers.authorization;
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    return decoded;
}

app.post('/login', (req, res) => {

    if (loginByToken(req)) {
        res.status(200).json({
            message: "Login con token excitoso!",
        });
        return;
    }

    const request = JSON.parse(JSON.stringify(req.body));

    if (request.user && request.pass) {
        const user = request.user;
        const pass = request.pass;

        const collection = database.collection('usuarios');
        collection.find({ name: user }).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                if (result[0].password == pass) {
                    //Crea el token 
                    console.log('Generando Token')
                    const token = jwt.sign(
                        { user: user, id: result[0]._id },
                        SECRET_JWT_KEY,
                        { expiresIn: '1h' }
                    );
                    res.status(200).json({
                        token: token,
                    });
                    return;
                }
                else {
                    res.json({
                        message: 'Contrasenha incorrecta',
                    });
                    return;
                }
            }
        })
    }
    else{
        res.status(400).json({
            message: 'Datos incompletos',
        });
        return;
    }
});

app.get('/user/:id', (req, res) => {

    if (!loginByToken(req)) {
        res.status(401).json({
            message: 'Token invalido',
        });
        return;
    }

    const id = req.params.id;
    const collection = database.collection('usuarios');
    collection.find({ _id: mongodb.ObjectId(id) }).toArray(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            res.json({
                user: result,
            });
            console.log(result);
            return;
        }
    })

});

app.get('/eventos', (req, res) => {

    if (!loginByToken(req)) {
        res.status(200).json({
            message: 'Token invalido',
        });
        return;
    }

    const collection = database.collection('peliculas');
    collection.find({}).toArray(function(err, result) {
        if(err){
            console.log(err);
        }
        else {
            res.json({
                peliculas: result,
            });
            console.log(result);
            return;
        }
    })
});

app.get('/eventos/:id', (req, res) => {

    if (!loginByToken(req)) {
        res.status(401).json({
            message: 'Token invalido',
        });
        return;
    }

    const id = req.params.id;
    const collection = database.collection('peliculas');
    collection.find({ _id: mongodb.ObjectId(id) }).toArray(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            res.json({
                peliculas: result,
            });
            console.log(result);
            return;
        }
    })

});


module.exports = app;