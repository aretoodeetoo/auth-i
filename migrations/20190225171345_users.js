
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', users => {
        users.increments();
        users
            .string('username', 155)
            .notNullable()
            .unique();
        users.string('password', 155).notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users');
};
