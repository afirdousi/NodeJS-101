/**
 * Created by Anas on 10/17/2015.
 */

///////////////////////////////////////////////
// Server Components
///////////////////////////////////////////////

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var morgan = require("morgan");

var jwt = require("jsonwebtoken");
var config = require("./app/config");


///////////////////////////////////////////////
// Server Configuration
///////////////////////////////////////////////

var port = process.env.PORT || 9955;
app.set("secret",config.secret);

///////////////////////////////////////////////
// Middle wares
///////////////////////////////////////////////

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(morgan("dev"));


///////////////////////////////////////////////
// Application Routes
///////////////////////////////////////////////


// App Level Routes
app.get('/',function(req,res){
    res.send("Hello from Node !!! This is a test api!!")
});


// Api Level Routes ---------------------
var apiRouter = express.Router();

//API to get generate a JWT token
apiRouter.post('/authenticate', function(req, res) {

    var user = {
        name:req.body.userName,
        password:req.body.password
    };

    var validUser=false;

    if(req.body.userName=="abc"){
        validUser=true;
    }

    if (!validUser) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else{

        // check if password matches
        if ("123" != req.body.password) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

            // if user is found and password is right
            // create a token
            var token = jwt.sign(user, app.get('secret'), {
                expiresInMinutes: 60 * 24 // expires in 24 hours
            });

            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }

    }

});

///////////////////////////////////////////////
//Middleware for /api routes
//Place authenticate JWT before going to requested route
///////////////////////////////////////////////
apiRouter.use(function(req,res,next){

    console.log("Received call to User API ");

    //Check if user sent JWT in request
    var token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(token){

        //Check JWT validity
        jwt.verify(token,app.get("secret"),function(err,decoded){
            if(err){
                //Invalid JWT sent > Reject Request
                return res.json({success:false,message:"Failed to authenticate token"});

                //We will not do a next() here which means we reject user from going to the requested route

            }else{
                //Valid JWT sent
                req.decoded = decoded;

                //Go to actual requested route
                next();
            }

        });

    } else{

        //JWT not found in request > Reject Request
        return res.status(403)
                    .send({success:false,message:"Token not found with request"});

    }

});


///////////////////////////////////////////////
// API Routes
///////////////////////////////////////////////

apiRouter.get('/',function(req,res){
    res.json({msg:"Hello from a User API"})
});

apiRouter.get('/users',function(req,res){
    var users =[{name:"Abc",age:80},
                {name:"Lmn",age:90},
                {name:"Pqr",age:100}
                ];

    res.json(users);
});

apiRouter.get('/user/:userId',function(req,res){

    var selectedUser ={id:req.params.userId,name:"Xyz"};
    res.json(selectedUser);

});


//Register API Routes
app.use('/api',apiRouter);



///////////////////////////////////////////////
// Bootstrap the Server
///////////////////////////////////////////////
app.listen(port);
console.log("Node Server happily running @ http://localhost:9955");

