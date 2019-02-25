const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// const db = require('./dbConfig');
const Users = require('./usersDb');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

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
    const { username, password } = req.headers;

    if (username && password) {
        Users.findBy({ username })
            .first()
            .then(user => {
                if (user && bcrypt.compareSync(password, user.password)) {
                    next();
                } else {
                    res.status(401).json({ message: 'Invalid username or password'});
                }
            })
            .catch(error => {
                res.status(500).json({ message: 'Sorry about this - had an unexpected error'});
            });
    } else {
        res.status(400).json({ message: 'No username or password input provided '});
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

const port = 5000;
server.listen(port, () => console.log('Server running on port 5000'));