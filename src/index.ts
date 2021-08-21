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

// import all common controllers
import '@controllers/common/converters/videoNote/index'
import '@controllers/common/converters/voiceMessage/index'
