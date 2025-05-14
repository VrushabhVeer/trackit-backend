import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        company: { type: String, required: true, trim: true, unique: true },
        position: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["Applied", "In Progress", "Rejected", "Get Offer"],
            default: "Applied",
        },
        date: { type: String, required: true },
        platform: { type: String, required: true },
        website: { type: String },
        notes: { type: String },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const JobModel = mongoose.model("job", jobSchema);
export default JobModel;