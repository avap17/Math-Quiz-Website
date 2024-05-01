// We are using useState to create a state variable message and useEffect to call the API when the component mounts.
import React, { useState, useEffect } from "react";

import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  //useEffect(() => { //  we are calling the API using fetch() and setting the response to the message state variable
    // we have passed an empty array as the second argument to the useEffect hook 
    // i.e the deps the parameter which will make sure that the useEffect hook is called only once when the component mounts.
    /* fetch("http://localhost:8000/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []); 

  return (
    <div className="App">
      <h1>{message}</h1>
    </div>
  ); */
}

export default App