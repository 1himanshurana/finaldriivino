// cd C:\Program Files\MySQL\MySQL Server 8.0\bin
// cd C:\Users\user\Desktop\vsCode\DELTA\sqlwithnode
// mysql -u root -p
// source C:\Users\user\Desktop\vsCode\DELTA\sqlwithnode\schema.sql
const fs = require('fs');

const mysql = require('mysql2');

const express = require("express");
const app = express();

const path = require("path");
const { log } = require('console');
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname, "public")));




// session manager -------
const session = require('express-session');

app.use(session({
  secret: 'ab',
  resave: false,
  saveUninitialized: false
}));




const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const method = require("method-override");
// app.use(method("_method"));
// app.use(express.urlencoded({extended: true}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'drivino', 
    password: 'hr8178',
  });


  app.post("/login" , (req,res) => {
    let {password: formpass , username: formuser} = req.body;
    let q = `SELECT * FROM user WHERE username = '${formuser}'`;
    try{
      connection.query(q ,  (err, result) => {
          if(err) throw err;
          if (result.length === 0) {
            return res.send("Username not found");
        }
        else if(formpass != result[0].password){
            res.send("Wrong username or password");
          }
          else{
            let loggedInUsername = result[0].username;
            req.session.loggedInUsername = loggedInUsername;
            let loggedInname = result[0].fullname;
            req.session.loggedInname = loggedInname;

            //   res.render("index.ejs",{loggedInUsername , loggedInname});
            
            res.redirect("/home");
          }
          
      });
    }catch(e){
      console.log(e);
      res.send("some error occ");
     
    }
});





app.post("/register" , (req,res) => {
    let {fullname , username , email , password} = req.body;
    let q = `select * from user where username = '${username}'`;
    // let q = `INSERT INTO user (fullname, username, email, password) VALUES (?, ?, ?, ?)`;
    let values = [fullname, username, email, password];
    
    try{
      connection.query(q ,username,  (err, result) => {
          if(err) throw err;
          if (!(result.length === 0)) {
            return res.send("Username Already Exists");
        }
          else{
                let q = `INSERT INTO user (fullname, username, email, password) VALUES (?, ?, ?, ?)`;
                connection.query(q ,values,  (err, result) => {
                    if(err) throw err;
                    res.redirect("/home");
                });
          }
          
      });
    }catch(e){
      console.log(e);
      res.send("some error occ");
     
    }
});


  app.get("/home" , (req , res) => {
      if(req.session.loggedInUsername){
          res.render("index.ejs", { loggedInUsername: req.session.loggedInUsername,loggedInname:req.session.loggedInname});
        }
        else{
          res.render("index.ejs", { loggedInUsername: null ,});
    }
      });
  // app.get("/getCar" , async (req , res) => {
  //   let q1 = "select * from sedan";
  //   let q2 = "select * from hatchback";
  //   let q3 = "select * from suv";
  //   let q4 = "select * from luxury";

  //   let arr = [];

  //   try{
  //     connection.query(q1 ,  (err, result) => {
  //         arr.push(result);
  //         if(err) throw err;
           
  //     });}catch(e){
  //       console.log(e);
  //       res.send("some error occ");
  //     }
  //     try{
  //       connection.query(q2 ,  (err, result) => {
  //         arr.push(result);
  //           if(err) throw err;
            
  //       });}catch(e){
  //         console.log(e);
  //         res.send("some error occ");
  //       }
  //       try{
  //         connection.query(q3 ,  (err, result) => {
  //           arr.push(result);
  //             if(err) throw err;
              
  //         });}catch(e){
  //           console.log(e);
  //           res.send("some error occ");
  //         }
          
  //         try{
  //           connection.query(q4 ,  (err, result) => {
  //             arr.push(result);
  //               if(err) throw err;
                
  //           });
  //   }catch(e){
  //     console.log(e);
  //     res.send("some error occ");
  //   }
  //   console.log(arr);
  //   if(req.session.loggedInUsername){
  //       res.render("getcar.ejs", { loggedInUsername: req.session.loggedInUsername , sedan:arr[0] , hatch:arr[1] , suv:arr[2] , luxury: arr[3]});
  //     }
  //     else{
  //       res.render("getcar.ejs", { loggedInUsername: null  , sedan:arr[0] , hatch:arr[1] , suv:arr[2] , luxury: arr[3]});
  // }
  //     });


  app.get("/getCar", async (req, res) => {
    try {
        const q1 = "select * from sedan";
        const q2 = "select * from hatchback";
        const q3 = "select * from suv";
        const q4 = "select * from luxury";

        const results = await Promise.all([
            queryDatabase(q1),
            queryDatabase(q2),
            queryDatabase(q3),
            queryDatabase(q4)
        ]);

        const [sedan, hatchback, suv, luxury] = results;
        

        if (req.session.loggedInUsername) {
            res.render("getcar.ejs", { loggedInUsername: req.session.loggedInUsername,loggedInname:req.session.loggedInname, sedan, hatchback, suv, luxury });
        } else {
            res.render("getcar.ejs", { loggedInUsername: null, sedan, hatchback, suv, luxury });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

function queryDatabase(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}





  app.get("/contactUs" , (req , res) => {
    if(req.session.loggedInUsername){
        res.render("contact.ejs", { loggedInUsername: req.session.loggedInUsername,loggedInname:req.session.loggedInname });
      }
      else{
        res.render("contact.ejs", { loggedInUsername: null });
  }
      });

      app.get("/logout", (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.redirect("/home"); // Redirect to login page after logout
        });
    });


    app.get("/getCar/booking/:type/:carid",(req, res) => {


      let {type ,carid} =req.params;
      console.log(req.params);
      let q = `select * from ${type} where id = ${carid}`;
      try{
          connection.query(q ,  (err, result) => {
          
    // console.log(req.params);
    // let { type, carid } = req.params;
    // let q = `select * from ${type} where id = ?`; // Using prepared statements
    // try {
    //     connection.query(q, [carid], (err, result) => {
            if(err) throw err;
            let data = result[0];
            console.log("------------------------",data);
            if(req.session.loggedInUsername){
              res.render("bookcar.ejs", { loggedInUsername: req.session.loggedInUsername,loggedInname:req.session.loggedInname , data});
            }
            else{
              res.render("bookcar.ejs", { loggedInUsername: null , loggedInname:null , data});
        }
        });
      }catch(e){
        console.log(e);
        res.send("some error occ");
       
      }
      
    });





    // confirm booking------------



  //   app.post('/confirmBooking', (req, res) => {
  //     const {name,username,carname,cartype,fromDate, toDate,    carid } = req.body;
  //     // Process the data and store it in the database
  //     // Perform necessary validation and database operations here
      
  //     // Example: Insert data into the database using MySQL
  //     connection.query('INSERT INTO bookings (fromDate, toDate, username, name, cartype, carid) VALUES (?, ?, ?, ?, ?, ?)', [fromDate, toDate, username, name, cartype, carid], (err, result) => {
  //         if (err) {
  //             console.error('Error:', err);
  //             res.status(500).send('Internal server error');
  //             return;
  //         }
  //         // Send a response back to the client
  //         res.send('Booking confirmed successfully!');
  //     });
  // });


  app.post("/getCar/booking/confirm/:carname/:carid", (req, res) => {
    const {carname, carid} = req.params;
    // console.log("-----------------------------",req.query);
    // console.log("-----------------------------",req.params);
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const username = req.query.username;
    const name = req.query.name;
    const cartype = req.query.cartype;
    const price = req.query.price;

    let dataArray = [name , username , carname , cartype , carid , fromDate , toDate ,price];

   let q = `insert into bookings(name , username , carname , cartype , carid , from_date , to_date ,totalprice) values(?)`;

   try{
    connection.query(q , [dataArray], (err, result) => {
      if(err) throw err;
      console.log(result);
      res.redirect((`/getCar/booking/${cartype}/${carid}`))
              
    });
  }catch(e){
    console.log(e);
    res.send("some error occ");
   
  }
});





      app.listen("8080", () => {
        console.log("server is listening");
      });















      

//   app.post("/login" , (req,res) => {
//     console.log()
//     let {password: formpass , username: formuser} = req.body;
//     let q = `SELECT * FROM user WHERE username = '${formuser}'`;
//     try{
//       connection.query(q ,  (err, result) => {
//         console.log(result);
//           if(err) throw err;
//           console.log(result);
//           if (result.length === 0) {
//             return res.send("Username not found");
//         }
//         else if(formpass != result[0].password){
//             res.send("Wrong username or password");
//           }
//           else{
//             let logininfo = true;
//               res.render("index.ejs");
//           }
          
//       });
//     }catch(e){
//       console.log(e);
//       res.send("some error occ");
     
//     }
// });

