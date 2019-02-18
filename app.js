const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const redis = require('redis')
const path = require('path')
const methodOverride = require('method-override')

let client = redis.createClient()

client.on('connect' , () => {
    console.log('Connected to Reddis')
})

//port 
const port = process.env.port || 3000

//init app 
const app = express()

//View Engine
app.engine('handlebars' , exphbs({defaultLayout : 'main'}))
app.set('view engine' , 'handlebars')

//body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

//methodOverride
app.use(methodOverride('_method'))

//Route

app.get('/' , (req , res , next) => {
    res.render('searchusers')
})

//search an user
app.post('/user/search' , function(req , res , next){
    let id = req.body.id
   
    client.hgetall(id , (err , obj) => {
       
        if(!obj){
            res.render('searchusers' , {
                error : "user doesnt exists"
            })
        }
        else{
            obj.id = id
            res.render('details' , {
                user : obj
            })
        }
    })
})

// Process add user
app.post('/user/add' , (req , res , next) => {
    let id = req.body.id
    let first_name = req.body.first_name
    let last_name = req.body.last_name
    let email = req.body.email
    let phone = req.body.phone

    client.hmset(id , [
        'first_name' , first_name,
        'last_name' , last_name,
        'email' , email,
        'phone' , phone 
    ] , (err , reply) => {
        if(err){
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    })
})

//Delete the user
app.delete('/user/delete/:id' , (req, res , next) => {
    client.del(req.params.id)
    res.redirect('/')
})

app.get('/user/add' , (req , res , next) => {
    res.render('addusers')
})

app.listen(port , () => {
    console.log(`The server is up and running on ${port}`)
})

