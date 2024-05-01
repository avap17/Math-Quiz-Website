const express = require('express'); // import that express.js framework 
const bodyParser = require('body-parser'); // body-parser used for parsing JSON data
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://k29:n5wHU0XA0yAbpVIW@cluster0.p6vjnqt.mongodb.net/?retryWrites=true&w=majority";
const bcrypt = require('bcrypt'); // bycrypt library 
 
const app = express(); // create express instance
const port = 3000; 

// tells Express to use the body-parser middleware -> important for handling JSON data (user registration and login data)
app.use(bodyParser.json()); 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  // connect to MongoDB
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");

      const db = client.db('MathQuizDatabase'); // callback function

      // registration route: receive user registration data from the front-end and store in the MongoDB database
      app.post('/register', async (req, res) => { // trigger the route when POST request is sent
        const { username, password } = req.body; // extract the username and password fields
    
        // additional registration checks:
    
        // first: check that username and password are not empty
        if (!username || !password) {
          return res.json({ success: false, message: 'Username and password are required' });
        }
    
        // second: check that username is unique (not case sensitive)
        const existingUser = await db.collection('users').findOne({ username: { $regex: new RegExp(username, 'i') } });
        if (existingUser) {
          return res.json({ success: false, message: 'Username already exists, please choose another' });
        }
    
        /*
        * third: check that password meets certain criteria (this will be case sensitive)
        *        - longer than 10 characters
        *      - combination of uppercase letters, lowercase letters, numbers, and symbols/special characters from
        *        the set of " @ # $ % & ^ / ( { [ ] } ) + - * = ? ' ~ _ . , ; : < >
        */
        const passwordRegex = "";
        if (!passwordRegex.test(password)) {
          return res.json({
            success: false,
            message: 'Password must be at least 10 characters long and include a combination of uppercase letters, lowercase letters, numbers, and symbols',
          });
        }
    
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // store user login information in the database
        // insert a new user containing the username and password
        db.collection('users').insertOne({ username, password: hashedPassword }, (err, result) => {
          if (err) throw err;
    
          res.json({ success: true, message: 'Registration successful' });
        });
      });
    
      // login route: checking user information (username and password) upon login
      app.post('/login', (req, res) => { // trigger the route when POST request is sent
        const { username, password } = req.body; // extract username and password
        
        /*
        * extra login check (before checking for existing username and passwords): 
        * check that username and password fields are not empty
        */
        if (!username || !password) {
          return res.json({ success: false, message: 'Username and password are required' });
        }
    
        // check credentials (username and password) in the database
        db.collection('users').findOne({ username }, (err, user) => {
          if (err) throw err; 
    
          if (user) { // if user is found
    
            // compare password in database
            bcrypt.compare(password, user.password, (err, result) => {
              if (err) throw err;
    
              if (result) { 
                // successful login
                res.json({ success: true, message: 'Login successful' }); // temporary successful login message
              } else {  
                // failed login
                res.json({ success: false, message: 'Invalid password' }); // temporary failed login message
              }
            });
          } else { 
            // failed login
            // NOTE: there should also be an option on the frontend for users to choose to go to registration from this part
            res.json({ success: false, message: 'Username not found' });
          }
        });
      });
    
      app.post('/feedback', authenticateUser, async (req, res) => { // trigger the route when POST request is sent
        const { feedback } = req.body; // extract feedback from body
    
        db.collection('users').insertOne({ username, feedback }, (err, result) => {
          if (err) throw err;
    
          res.json({ success: true, message: 'Feedback submitted successfully' });
        });
      });
    
      // function that verifies the user before submitting feedback
      async function authenticateUser(req, res, next) {
        // Get the token from the request header
        const token = req.header('Authorization');
      
        // Check if the token is present
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized - Missing token' });
        }
      
        try {
          // check credentials (username) in the database
          db.collection('users').findOne({ username }, (err, user) => {
            if (err) throw err; 
    
            if (user) { // if user is found
              next();
            } else { 
              // failed login
              res.json({ success: false, message: 'Error verifying user' });
            }
          });
        } catch (error) {
          // Token verification failed
          console.error('Token verification failed:', error);
          res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
      }
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});