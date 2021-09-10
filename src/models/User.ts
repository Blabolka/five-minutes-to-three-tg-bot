import { Schema, model, Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { IUserModel } from '@interfaces/User'

const schema: Schema = new Schema(
    {
        _id: {
            type: String,
            default: nanoid(),
        },
        telegram_id: {
            type: Number,
            required: true,
        },
        is_bot: {
            type: Boolean,
            required: true,
        },
        first_name: {
            type: String,
            maxlength: 64,
            required: true,
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
        language_code: {
            type: String,
            maxlength: 2,
            required: true,
        },
    },
    {
        collection: 'users',
        versionKey: false,
    },
)

const UserModel: Model<IUserModel> = model<IUserModel>('User', schema)
export default UserModel
