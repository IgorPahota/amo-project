const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://amoUser:amoUser@cluster0-1qzj7.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useCreateIndex: true
});

module.exports = mongoose.connection;
