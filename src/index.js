const express = require("express");
const bodyParser = require('body-parser');
const {default:mongoose} = require("mongoose");
const route = require("./routes/route")
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://rahul_8651080470:7tvW8IuaU608kdhl@cluster0.zmjtewh.mongodb.net/project1",{
    useNewUrlParser: true
}).then(() => console.log("MongoDb is connected"))
.catch( err => console.log(err) )


app.use('/', route); // it will access my route file.

//3000 is my port which i am using to connect with the server
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});