import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

// for pretty path in import expression
import 'module-alias/register'

// connection to database
import '@db'

// import all stages
import '@controllers/stages/start/index'
import '@controllers/stages/converting/index'
import '@controllers/stages/modification/index'
