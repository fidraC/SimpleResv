// Import bootstrap, styles, and times.css
import "../../src/bootstrap/css/bootstrap.css";
import "../css/styles.css";
import "../css/times.css";

import {
  AddFavoriteTime,
  Setting,
  DeleteFavoriteTime,
} from "../../wailsjs/go/main/App";

function main() {
  runtime.WindowSetSize(2560, 1600);

  let startTimeSelector = document.getElementById("start-datetime");
  let endTimeSelector = document.getElementById("end-datetime");

  // Make input type date
  startTimeSelector.innerHTML = `
<div class="form-group">
    <input type="datetime-local" class="form-control" id="starttime-form" value="2022-01-01T00:00">
</div>
`;

  endTimeSelector.innerHTML = `
<div class="form-group">
    <input type="datetime-local" class="form-control" id="endtime-form" value="2022-01-01T00:00">
</div>
`;
  // Render favorite times
  renderFavs();
}

function renderFavs() {
  // Get element by id favorite times list
  let favoriteTimesList = document.getElementById("favorite-times-list");
  // Reset favorite times list
  favoriteTimesList.innerHTML = "";
  // Get favorite times
  getFavoriteTimes()
    .then((result) => {
      let favoriteTimes = result;
      // Console log data type of favorite times
      console.log(favoriteTimes);
      // Loop through favorite times if is not null
      if (favoriteTimes != null) {
        // Log favs reloaded
        for (let i = 0; i < favoriteTimes.length; i++) {
          // Get name, start, and end time of favorite time
          let name = favoriteTimes[i].name;
          let start = favoriteTimes[i].start;
          let end = favoriteTimes[i].end;
          // Make favorite time list banner. On click, run timeApply function
          favoriteTimesList.innerHTML += `
          <div class="favorite-time-list-banner" onclick="timeApply('${start}', '${end}')">
              <button class="btn btn-danger btn-sm" id="delete-fav" onclick="delFav('${name}')">x</button>
              <div class="favorite-time-list-banner-name">${name}</div>
              <div class="favorite-time-list-banner-times">${start} - ${end}</div>
          </div>
          `;
        }
        console.log("Favs reloaded");
        console.log(favoriteTimes);
      } else {
        // If there are no favorite times, display message
        favoriteTimesList.innerHTML = `
        <div class="favorite-time-list-banner">
            <div class="favorite-time-list-banner-name">No favorite times</div>
        </div>`;
      }
      // Add a button to add favorite times
      favoriteTimesList.innerHTML += `
    <div class="favorite-time-list-btn-container" onclick="addFavoriteTime()">
      <button type="button" class="btn btn-primary favorite-time-list-btn">Add Favorite Time</button>
    </div>
    `;
    })
    .catch((err) => {
      console.error(err);
    });
}

// Delete favorite time
window.delFav = function (name) {
  // Run DeleteFavoriteTime function
  DeleteFavoriteTime(name)
    .then((result) => {
      if (result == true) {
        renderFavs();
      } else {
        console.log("Failed to delete favorite time");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// Function to add favorite time
window.addFavoriteTime = function () {
  // Get start and end times
  let times = getFormTime();
  // Set start and end times from times
  let startTime = times[0];
  let endTime = times[1];
  // Remove date from start and end times
  startTime = startTime.split(" ")[1];
  endTime = endTime.split(" ")[1];
  // Get name from alert input
  let name = prompt("Enter name");
  // Log details to console
  console.log(name);
  console.log(startTime);
  console.log(endTime);
  // If name is not null and blank, add favorite time
  if (name != null && name != "") {
    AddFavoriteTime(name, startTime, endTime)
      .then((result) => {
        // Refresh favs
        renderFavs();
        // Alert user that favorite time was added
        alert("Favorite time added");
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    // Alert user that favorite time was not added
    alert("Favorite time not added");
  }
};

// Function to add favorite time
function getFormTime() {
  let starttimeForm = document.getElementById("starttime-form");
  let endtimeForm = document.getElementById("endtime-form");
  // Get values from start and end times forms and convert format from YYYY-MM-DDTHH:MM to YYYY-MM-DD HH:MM:SS
  let startTime = starttimeForm.value;
  let endTime = endtimeForm.value;
  // replace T with space
  startTime = startTime.replace(/T/g, " ");
  endTime = endTime.replace(/T/g, " ");
  // add :00 to the end of the time
  startTime = startTime + ":00";
  endTime = endTime + ":00";
  // Return start and end time
  return [startTime, endTime];
}

// Function to get favorite times
function getFavoriteTimes() {
  // Get settings
  return Setting().then((result) => {
    let settings = result;
    // Parse settings from JSON string to object
    settings = JSON.parse(settings);
    // Get favorite times from settings
    let favoriteTimes = settings.favorite_times;
    // Console log
    console.log(favoriteTimes);
    return favoriteTimes;
  });
}

// String to date function
function strToDate(dtStr) {
  console.log(dtStr);
  if (!dtStr) return null;
  let dateParts = dtStr.split("-");
  let timeParts = dateParts[2].split(" ")[1].split(":");
  dateParts[2] = dateParts[2].split(" ")[0];
  // month is 0-based, that's why we need dataParts[1] - 1
  let dateObj = new Date(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    timeParts[0],
    timeParts[1],
    timeParts[2]
  );
  return dateObj;
}
window.nextWindow = function () {
  // Get start and end times from form
  let times = getFormTime();
  // Set start and end times from times
  let startTime = times[0];
  let endTime = times[1];
  // Check if the input is empty
  if (startTime === null || endTime === null) return;
  // Get current time
  let currentTime = new Date();
  // string to date
  let startDateD = strToDate(startTime);
  let endDateD = strToDate(endTime);
  // Verify that start time is after current time
  if (startDateD < currentTime) {
    alert("Start time must be after current time");
    return;
  }
  // Verify that end time is after start time
  if (endDateD < startDateD) {
    alert("End time must be after start time");
    return;
  }
  // Verify that end time is after current time
  if (endDateD < currentTime) {
    alert("End time must be after current time");
    return;
  }
  // Store startTime and endTime in localStorage
  localStorage.setItem("startTime", startTime);
  localStorage.setItem("endTime", endTime);
  // Redirect to next page (items.html)
  window.location.href = "items.html";
};

window.showMenu = function () {
  // If fav-menu display is block then hide it
  if (document.getElementById("fav-menu").style.display === "block") {
    document.getElementById("fav-menu").style.display = "none";
  } else {
    // Set fav-menu display to block
    document.getElementById("fav-menu").style.display = "block";
  }
};

// Sets value of start and end time forms to fav time selected
window.timeApply = function (starttime, endtime) {
  // Remove seconds from start and end times
  starttime = starttime.split(":")[0] + ":" + starttime.split(":")[1];
  endtime = endtime.split(":")[0] + ":" + endtime.split(":")[1];
  // Get form datetime
  let starttimeForm = document.getElementById("starttime-form");
  let endtimeForm = document.getElementById("endtime-form");
  // Get form datetime value
  let starttimeFormValue = starttimeForm.value;
  let endtimeFormValue = endtimeForm.value;
  // Replace form value hours and minutes with starttime and endtime
  starttimeFormValue = starttimeFormValue.replace(
    /[0-9]{2}:[0-9]{2}/,
    starttime
  );
  endtimeFormValue = endtimeFormValue.replace(/[0-9]{2}:[0-9]{2}/, endtime);
  // Set form value to starttime and endtime
  starttimeForm.value = starttimeFormValue;
  endtimeForm.value = endtimeFormValue;
  // Console log
  console.log(starttimeFormValue);
  console.log(endtimeFormValue);
};

main();
