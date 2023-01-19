import "../bootstrap/css/bootstrap.css";
import "../css/styles.css";
import "../css/login.css";

import { Login, Setting } from "../../wailsjs/go/main/App";

main();

function getSettings() {
  // Get settings from back end and parse JSON string to object
  Setting()
    .then((result) => {
      let settings = result;
      // Set settings in local storage
      localStorage.setItem("settings", settings);
      // Log settings
      console.log(settings);
    })
    .catch((error) => {
      console.log(error);
    });
  // Get settings from local storage
  let settings = localStorage.getItem("settings");
  // Convert settings from JSON string to object
  settings = JSON.parse(settings);
  // Settings are returned as a JSON string
  // Get username and password from settings
  let username = settings.username;
  let password = settings.password;
  // Log username and password
  console.log(username);
  console.log(password);
  // Check if the input is empty
  if (username === "" || password === "") return;
  // Set the input fields to the settings username and password
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
}

window.login = function () {
  // Get username and password
  let usernameElement = document.getElementById("username");
  let passwordElement = document.getElementById("password");
  let username = usernameElement.value;
  let password = passwordElement.value;
  // Check if the input is empty
  if (username === "" || password === "") return;
  // Call App.Login(username, password)
  login(username, password);
};

function login(username, password) {
  try {
    Login(username, password)
      .then((result) => {
        // If login is successful, show home page
        if (result) {
          console.log("Logged in successfully");
          window.location.href = "home.html";
        }
        // If login is unsuccessful, alert the user
        else {
          console.error(result);
          alert("Login failed");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error(err);
  }
}

// Main function
function main() {
  runtime.WindowSetSize(600, 400);

  // Make login form
  document.querySelector("#login").innerHTML = `
  <div class="container">
      <input type="text" id="username" placeholder="Username" required autofocus><br>
      <input type="password" id="password" placeholder="Password" required><br>
      <button class="btn btn-lg btn-secondary btn-block" type="submit" onclick="login()">Sign in</button>
  </div>
  `;

  getSettings();
}
