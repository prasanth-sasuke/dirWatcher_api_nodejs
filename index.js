const express =require("express");
const cors =require('cors');
const {appConfig} = require('./src/config/appConfig.js')
const { success } =require('./src/helper/response.js');
const serverRouter = require('./src/routes/routes.js')

const app = express()
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
const corsOption = {
    origin: 'http://localhost:3000/',
    optionSuccessStatus: 200
}



app.use(cors());
app.use('/dev', serverRouter);
let port = appConfig.PORT
app.listen(port, () => {
    console.log("Serever running on port", port);
})