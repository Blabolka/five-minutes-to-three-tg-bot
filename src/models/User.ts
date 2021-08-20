import { Schema, model, Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { User } from '@interfaces/User'

const schema: Schema<User> = new Schema<User>(
    {
        _id: {
            type: String,
            default: () => nanoid(),
        },
        is_bot: {
            type: Boolean,
            required: [true, '"is_bot" is required field'],
        },
        first_name: {
            type: String,
            maxlength: 64,
            required: [true, '"first_name" is required field'],
        },
        last_name: {
            type: String,
            maxlength: 64,
            required: false,
        },
        username: {
            type: String,
            maxlength: 32,
            required: false,
        },
    },
    { collection: 'users' },
)

const UserModel: Model<User> = model<User>('User', schema)
export default UserModel
