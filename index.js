const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const db = require('./dbConfig');
const Users = require('./usersDb');

const server = express();

const sessionConfig = {
    name: 'cookieOne',
    secret: 'two can keep a secret if one of them is dead',
    cookie: {
        maxAge: 1000 * 60 * 60, // in ms
        secure: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,

    store: new KnexSessionStore({
        knex: db,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 60
    })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));


server.get('/', (req, res) => {
    res.send('It works!');
});

server.post('/api/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.insert(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.status(200).json({ message: `Welcome, ${user.username}`})
            } else {
                res.status(401).json({ message: 'Wrong username or password'});
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

function restrict(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'You shall not pass!!'});
    }
}

server.get('/api/users', restrict, (req, res) => {
    Users
        .find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
})

server.get('/api/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(err => {
            if (err){
                res.send('Goodbye sweet world');
            } else {
                res.send('its been real thanks');
            }
        })
    } else {
        res.end();
    }
})

const port = 5000;
server.listen(port, () => console.log('Server running on port 5000'));