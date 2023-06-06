import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    email: {
        type: String
    },
    token: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"]
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date
    }
});

var tokenModel = mongoose.model("tokenModel", tokenSchema);

export default tokenModel;