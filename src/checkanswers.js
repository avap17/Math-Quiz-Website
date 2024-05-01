const express = require('express'); // import that express.js framework 
const bodyParser = require('body-parser'); // body-parser used for parsing JSON data
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt'); // bycrypt library 
const fs = require('bycrypt');
const csv = require('csv-parser');
 
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

      // Quia answer route
      app.post('/check-answer', (req, res) => {
        const { userInput } = req.body;

        // first checks if the user inputted anything
        if (!userInput) {
          return res.json({ success: false, message: 'User input is required' });
        }

        // read the CSV file and check the user's input against the correct answers for the question
        const questions = [];
        fs.createReadStream('QuestionDatabase.csv')
          .pipe(csv()).on('data', (row) => {
                // extract questions from the CSV file where 'question' is the first column
                const { question, answerChoice1, answerChoice2, answerChoice3, answerChoice4, correctAnswer } = row;

                // extract correct answer for the corresponding question where it is the last column 
                const correctAnswerChoice = `answer choice ${correctAnswer}`;

                // stores each question with its correct answer in the array
                questions.push({ question, correctAnswerChoice });
        })
        .on('end', () => {
            // check if the user's input matches the correct answer choice for the question
            const isAnswerCorrect = questions.some(({ question, correctAnswerChoice }) => {
                return userAnswer === correctAnswerChoice;
            });

            res.json({ success: true, isAnswerCorrect });
          });
      });
    
  }
  run().catch(console.dir);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
