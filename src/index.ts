import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

// for pretty path in import expression
import 'module-alias/register'

// import all controllers
import '@controllers/start/index'
import '@controllers/notification/index'
