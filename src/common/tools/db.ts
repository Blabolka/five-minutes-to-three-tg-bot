import mongoose from 'mongoose'

const connectUri: string = process.env.MONGO_CONNECT_URI || ''

mongoose
    .connect(connectUri)
    .then(() => console.log('Connected to db'))
    .catch((error) => console.error(error))
