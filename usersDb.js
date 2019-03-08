const db = require('./dbConfig');

module.exports = {
    insert,
    find,
    findBy,
    findById,
};

function find() {
    return db('users').select('id', 'username', 'password');
}

function findBy(filter){
    return db('users').where(filter);
}

async function insert(user){
    const [id] = await db('users').insert(user);
    return findById(id);
}

function findById(id){
    return db('users').where({ id }).first();
}