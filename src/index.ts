import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

// Need to set pretty path in import expression
import 'module-alias/register'

// Importing all controllers
import '@controllers/start/index'
import '@controllers/notification/index'
