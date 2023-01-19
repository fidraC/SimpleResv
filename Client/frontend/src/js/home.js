import "../../src/bootstrap/css/bootstrap.css";
import "../css/styles.css";
import "../css/home.css";

import logo from "../assets/images/SimpleResv_Logo.png";

runtime.WindowSetSize(1000, 450)

// Set the logo
document.getElementById("logo").src = logo;

window.timesPage = function() {
    window.location.href = "times.html";
}

window.managePage = function() {
    window.location.href = "manage.html";
}