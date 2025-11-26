import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: string,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
            minLength: 4,
            maxLength: 40
        }
    }
)