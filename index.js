const cors=require('cors')
const express=require('express')
var cron = require('node-cron')
const CheckUpdates = require('./CheckUpdates.js')

const app=express()
const port=process.env.PORT || 5000
app.use(cors())

//running a cron job every 5 seconds
cron.schedule('*/5 * * * * *', () => {
    console.log('running a task 5 seconds')
    //call function here
    CheckUpdates.requestApi()
});

app.listen(port, ()=> {
    console.log(`App running at ${port}`)
})