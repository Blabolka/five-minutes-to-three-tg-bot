import mongoose from 'mongoose'

const connectUri: string = process.env.MONGO_CONNECT_URI || ''

mongoose
    .connect(connectUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to db'))
    .catch((error) => console.error(error))
