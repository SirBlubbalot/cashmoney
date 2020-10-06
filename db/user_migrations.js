import conn from './connection'

// In migrations we simply check if the old table exists (e.g. users).
// If that's the case then we copy the data into a new table (e.g. users_2).
// Then we can drop the old table safely.

export const usersTable = 'users_2'

const queries = {
    tableExists: conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=:name"
    ),
    createUsers2: conn.prepare(`
        CREATE TABLE IF NOT EXISTS users_2 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_viewed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            credit_cents INTEGER NOT NULL DEFAULT 0
    )`),
}

export function createUsersTable() {
    queries.createUsers2.run()
}

/*
 * Adds `id INTEGER PRIMARY KEY AUTOINCREMENT` instead of using `name` as the primary key.
 */
export function migrateUsersToUsers2() {
    conn.transaction(() => {
        if (tableExists('users')) {
            queries.createUsers2.run()
            conn.exec(`INSERT INTO users_2 SELECT * FROM users;`)
            conn.exec('DROP TABLE users')
        }
    })
}

function tableExists(name) {
    return queries.tableExists.get({ name }) !== undefined
}
