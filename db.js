const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/cloudNotes";

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("connected to mongoDB sucessfully");
    });
};

module.exports = connectToMongo;