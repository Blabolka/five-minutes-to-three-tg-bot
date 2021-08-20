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
            required: [true, '"telegram_id" is required field'],
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
    {
        collection: 'users',
        versionKey: false,
    },
)

const UserModel: Model<IUserModel> = model<IUserModel>('User', schema)
export default UserModel
