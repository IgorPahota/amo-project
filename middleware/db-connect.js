const mongoose = require("mongoose");
const url = process.env.DB_URL;
mongoose.connect(`${url}`, {
  useNewUrlParser: true,
  useCreateIndex: true
});

module.exports = mongoose.connection;
