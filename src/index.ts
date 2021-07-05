import path from 'path'
import dotenv from 'dotenv'

const pathToEnv: string = path.resolve('.env')
dotenv.config({ path: pathToEnv })

// for pretty path in import expression
import 'module-alias/register'

// need for schedule messaging users of their lessons
import '@tools/scheduleNotifications'

// import all controllers
import '@controllers/start/index'
import '@controllers/notification/index'
