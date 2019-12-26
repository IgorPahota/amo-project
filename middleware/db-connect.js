const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/amoProject", {
  useNewUrlParser: true,
  useCreateIndex: true
});

module.exports = mongoose.connection;
