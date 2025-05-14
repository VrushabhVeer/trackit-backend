import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const UserModel = mongoose.model("user", userSchema);
export default UserModel;
