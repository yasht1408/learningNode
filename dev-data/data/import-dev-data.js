const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './cofig.env'});

const DB = 'mongodb+srv://yash:9X1mCYsCEsyitAxb@cluster0.cquek.mongodb.net/natours?retryWrites=true&w=majority';
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() =>{
    console.log('App is successfully connected to the Database');
});

//Read DATA from json file
const tour =JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//Importing data to database

//delete the existing data if any
const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        console.log('Data deleted successfully');
    } catch(err){
        console.log(err);
    }
    process.exit();
};

const importData = async ()=> {
    try{
        await Tour.create(tour);
        console.log('Data successfully added');
    } catch(err){
        console.log('error occured', err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);