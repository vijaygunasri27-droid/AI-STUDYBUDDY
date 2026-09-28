const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        content: {
            type: String
        },
        contentType: {
            type: String,
            required: true
        },
        fileUrl: {
            type: String
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Material", materialSchema);