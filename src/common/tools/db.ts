import { Pool } from 'pg'

// set parameters for connection to db
const db: Pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    database: process.env.PGDATABASE || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT as string, 10) || 5432,
    password: process.env.PGPASSWORD || '1',
    ssl: process.env.DATABASE_SSL === `true`,
})

db.connect()
    .then((): void => console.log('connected'))
    .catch((err: Error): void => console.error('connection error', err.stack))

export default db
