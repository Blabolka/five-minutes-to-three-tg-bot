import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

import 'module-alias/register'

import '@controllers/start/index'
