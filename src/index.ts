import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

// for pretty path in import expression
import 'module-alias/register'

// connection to database
import '@db'

// import all controllers
import '@controllers/stages/start/index'
import '@controllers/common/converters/videoNoteConverter/index'
