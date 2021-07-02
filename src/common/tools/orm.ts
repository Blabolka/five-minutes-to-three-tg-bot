import fs from 'fs-extra'
import dotenv from 'dotenv'
import { Client, QueryResult } from 'pg'

const cliCommands: () => Promise<void> = async (): Promise<void> => {
    switch (process.argv[2]) {
        case 'init': {
            await init()
            break
        }
        case 'clean': {
            await clean()
            break
        }
    }
}

async function init() {
    // load variables from .env
    dotenv.config()
    // create an instance of connection to db
    const client: Client = new Client()
    try {
        // connect to db
        await client.connect()
        await dropDatabaseTables(client)
        // getting text from initdb.pgsql for querying
        const sqlInit: string = await fs.readFile('./src/common/sqls/initdb.pgsql', {
            encoding: 'UTF-8',
        })
        // call method that convert text to query sql commands
        await querySql(sqlInit, client)
    } catch (error) {
        console.log(error)
    } finally {
        await client.end()
    }
}

const clean: () => Promise<void> = async (): Promise<void> => {
    dotenv.config()
    const client: Client = new Client()

    try {
        await client.connect()
        await dropDatabaseTables(client)
    } catch (err) {
        console.log(err)
        throw err
    } finally {
        await client.end()
    }
}

// method for querying sql from text
async function querySql(sql: string, client: Client): Promise<void> {
    // split the file into separate statements
    const statements: string[] = sql.split(/;\s*$/m)
    for (const statement of statements) {
        if (statement.length > 3) {
            // execute each of the statements
            await client.query(statement)
        }
    }
}

// method for deleting all database tables
async function dropDatabaseTables(client: Client): Promise<void> {
    // select all tables of current pg user
    const { rows: tables }: QueryResult = await client.query(
        `SELECT tablename AS "name"
         FROM pg_tables
         WHERE tableowner = $1
           AND schemaname = 'public';`,
        [process.env.PGUSER],
    )

    // deleting selected tables
    for (const table of tables) {
        await client.query(`DROP TABLE IF EXISTS ${table.name} CASCADE;`)
    }

    // select all types and enums
    const { rows: types }: QueryResult = await client.query(
        `SELECT pg_type.typname AS enumtype
         FROM pg_type
                  JOIN pg_enum
                       ON pg_enum.enumtypid = pg_type.oid
         GROUP BY pg_type.typname;`,
    )

    // deleting selected types and enums
    for (const type of types) {
        await client.query(`DROP TYPE IF EXISTS ${type.enumtype} CASCADE;`)
    }
}

cliCommands().then()
