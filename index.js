const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// const db = require('');
// const Users = require('');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
    res.send('It works!');
});

const port = 5000;
server.listen(port, () => console.log('Server running on port 5000'));