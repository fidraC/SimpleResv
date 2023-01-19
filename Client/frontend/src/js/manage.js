import "../../src/bootstrap/css/bootstrap.css";
import "../css/styles.css";
import "../css/manage.css";

import { Reservations, Cancel } from "../../wailsjs/go/main/App";

// Make a global list of reserved items
let cancelledReservations = [];

main();

function main() {
  runtime.WindowSetSize(2560, 1600);
  mapReservations();
}

// Map items to the DOM as cards
function mapReservations() {
  Reservations()
    .then((reservations) => {
      // Log the reservations
      console.log(reservations);
      // Parse reservations from json to an array
      let reservationsArray = JSON.parse(reservations);
      let reservationList = document.getElementById("reservation-list");
      reservationList.innerHTML = "";
      // Loop through the array and create a card for each reservation
      for (let i = 0; i < reservationsArray.length; i++) {
        // Reservation has fields item, startTime, endTime, and status
        let reservation = reservationsArray[i];
        let reservationCard = document.createElement("div");
        reservationCard.className = "reservation-list-item";
        reservationCard.id = `reservation-${reservation.item}`;
        // Convert reservation start_time and end_time to a readable format
        // From python timestamp to Year/Month/Day, Hour:Minute AM/PM
        let startTime = new Date(reservation.start_time * 1000);
        let endTime = new Date(reservation.end_time * 1000);
        let startTimeString = `${startTime.getFullYear()}/${
          startTime.getMonth() + 1
        }/${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()} ${
          startTime.getHours() >= 12 ? "PM" : "AM"
        }`;
        let endTimeString = `${endTime.getFullYear()}/${
          endTime.getMonth() + 1
        }/${endTime.getDate()} ${endTime.getHours()}:${endTime.getMinutes()} ${
          endTime.getHours() >= 12 ? "PM" : "AM"
        }`;
        // Reservation details and red cancel button if status is pending
        if (reservation.status == "pending") {
          reservationCard.innerHTML = `
                            <div class="card-body">
                                <h5 class="card-title">${reservation.item}</h5>
                                <p class="card-text">${startTimeString} - ${endTimeString}</p>
                                <p class="card-text">${reservation.status}</p>
                                <button class="btn btn-danger" onclick="cancelReservation('${reservation.id}')" id="button-${reservation.id}">Cancel</button>
                            </div>
                            `;
        } else {
          reservationCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${reservation.item}</h5>
                        <p class="card-text">${startTimeString} - ${endTimeString}</p>
                        <p class="card-text">${reservation.status}</p>
                    </div>
                    `;
        }
        reservationList.appendChild(reservationCard);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

// Cancel reservation function (Adds item to the list of cancelled reservations)
window.cancelReservation = function (itemID) {
  cancelReservation(itemID);
};

function cancelReservation(itemID) {
  // Add item to the list of cancelled reservations
  cancelledReservations.push(itemID);
  // Make the button red and change name to "Remove"
  let button = document.getElementById(`button-${itemID}`);
  button.className = "btn btn-secondary";
  button.innerHTML = "Reinstate";
  // Change onclick function to removeDevice
  button.onclick = function () {
    reinstateReservation(itemID);
  };
  // Console log the list of cancelled reservations
  console.log(cancelledReservations);
}

// Reinstate reservation function (Removes item from the list of cancelled reservations)
window.reinstateReservation = function (itemID) {
  reinstateReservation(itemID);
};

function reinstateReservation(itemID) {
  // Remove item from the list of cancelled reservations
  cancelledReservations = cancelledReservations.filter(
    (item) => item !== itemID
  );
  // Make the button green and change name to "Cancel"
  let button = document.getElementById(`button-${itemID}`);
  button.className = "btn btn-danger";
  button.innerHTML = "Cancel";
  // Change onclick function to cancelReservation
  button.onclick = function () {
    cancelReservation(itemID);
  };
  // Console log the list of cancelled reservations
  console.log(cancelledReservations);
}

// Done button function (Sends cancellation request to the server and goes back to the home page)
window.nextWindow = function () {
  // If there are no cancelled reservations, go to the home page
  if (
    cancelledReservations.length == 0 ||
    cancelledReservations == null ||
    cancelledReservations == ""
  ) {
    window.location.href = "home.html";
  } else {
    // Convert the list of cancelled reservations to a json string
    let cancelledReservationsString = JSON.stringify(cancelledReservations);
    // Send cancellation request to the server
    Cancel(cancelledReservationsString)
      .then((res) => {
        // If error in response, log error
        if (res == false) {
          alert("Failure: No idea what happened");
          console.error("Error cancelling reservation");
        } else {
          alert("Success: Reservation cancelled");
          window.location.href = "home.html";
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
};
