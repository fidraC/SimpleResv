import "../../src/bootstrap/css/bootstrap.css";
import "../css/styles.css";
import "../css/items.css";

import { Items, Reserve, AddFavoriteItems, Setting} from "../../wailsjs/go/main/App";

// Make a global list of reserved items
let availableItems = [];
let selectedItems = [];

main();

function main() {
  runtime.WindowSetSize(2560, 1600);

  mapItems();
}

window.addFavoriteItemGroup = function () {
  addFavoriteItemGroup(prompt("Enter a name for the group"));
}

// addFavoriteItems function (Adds items to the list of favorite items)
function addFavoriteItemGroup(name){
  // Loop through selectedItems and append into json string with field 'name'
  let favoriteItems = "";
  for (let i = 0; i < selectedItems.length; i++) {
    favoriteItems += `{ "name": "${selectedItems[i]}" },`;
  }
  // Remove last comma from json string
  favoriteItems = favoriteItems.slice(0, -1);
  // Pass to back end
  AddFavoriteItems(name, favoriteItems);
}

function renderFavs() {
  // Get element by id favorite items list
  let favoriteItemsList = document.getElementById("favorite-items-list");
  // Reset favorite items list
  favoriteItemsList.innerHTML = "";
  // Get favorite items
  getFavoriteItems()
    .then((result) => {
      let favoriteItems = result;
      // Loop through favorite items if is not null
      if (favoriteItems != null) {
        // Log favs reloaded
        for (let i = 0; i < favoriteItems.length; i++) {
          // Get name
          let name = favoriteItems[i].name;
          // Make favorite items list banner. On click, run itemsApply function
          favoriteItemsList.innerHTML += `
          <div class="favorite-item-list-banner" onclick="itemsApply('${itemsJSON}')">
              <button class="btn btn-danger btn-sm" id="delete-fav" onclick="delFav('${name}')">x</button>
              <div class="favorite-item-list-banner-name">${name}</div>
          </div>
          `;
        }
        console.log("Favs reloaded");
        console.log(favoriteItems);
      } else {
        // If there are no favorite items, display message
        favoriteItemsList.innerHTML = `
        <div class="favorite-item-list-banner">
            <div class="favorite-item-list-banner-name">No favorite items</div>
        </div>`;
      }
      // Add a button to add favorite items
      favoriteItemsList.innerHTML += `
    <div class="favorite-item-list-btn-container" onclick="addFavoriteItemGroup()">
      <button type="button" class="btn btn-primary favorite-item-list-btn">Add Favorite Item</button>
    </div>
    `;
    })
    .catch((err) => {
      console.error(err);
    });
}

window.showMenu = function () {
  // If fav-menu display is block then hide it
  if (document.getElementById("fav-menu").style.display === "block") {
    document.getElementById("fav-menu").style.display = "none";
  } else {
    // Set fav-menu display to block
    document.getElementById("fav-menu").style.display = "block";
  }
};

// Get favorite items
function getFavoriteItems() {
  return Setting().then((result) => {
    let settings = result;
    // Parse settings from JSON string to object
    settings = JSON.parse(settings);
    // Get favorite times from settings
    let favoriteItems = settings.favorite_item_groups;
    // Console log
    console.log(favoriteItems);
    return favoriteItems;
  });
}

// Map items to the DOM as cards
function mapItems() {
  // Get startTime and endTime from local storage
  let startTime = localStorage.getItem("startTime");
  let endTime = localStorage.getItem("endTime");
  Items(startTime, endTime)
    .then((results) => {
      // Parse items from json to an array
      let paresed_results = JSON.parse(results);
      // Get fields from parsed results
      let itemsArray = paresed_results.items;
      let reservedArray = paresed_results.reserved;
      let itemList = document.getElementById("item-list");
      itemList.innerHTML = "";
      // Loop through the array and create a card for each item
      for (let i = 0; i < itemsArray.length; i++) {
        let item = itemsArray[i];
        availableItems.push(item.name);
        let itemCard = document.createElement("div");
        itemCard.className = "item-list-item";
        itemCard.id = `item-${item.name}`;
        itemCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <button class="btn btn-primary" onclick="addDevice('${item.name}')" id="button-${item.name}">Add</button>
                </div>
                `;
        itemList.appendChild(itemCard);
      }
      // Loop through the array and create a card for each reserved item
      for (let i = 0; i < reservedArray.length; i++) {
        let item = reservedArray[i];
        let itemCard = document.createElement("div");
        itemCard.className = "item-list-item";
        itemCard.id = `item-${item.name}`;
        itemCard.innerHTML = `
                <div class="card-body disabled">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <button class="btn btn-secondary disabled" disabled="disabled" id="button-${item.name}">Not available</button>
                </div>
                `;
        itemList.appendChild(itemCard);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

// Define reserveDevice function (Adds item to the list of reserved items)
window.addDevice = function (itemName) {
  addDevice(itemName);
};

function addDevice(itemName){
  // Add item to the list of reserved items
  selectedItems.push(itemName);
  // Make the button red and change name to "Remove"
  let button = document.getElementById(`button-${itemName}`);
  button.className = "btn btn-danger";
  button.innerHTML = "Remove";
  // Change onclick function to removeDevice
  button.onclick = function () {
    removeDevice(itemName);
  };
  // Console log the list of reserved items
  console.log(selectedItems);
  // Update number of items reserved at submit button
  document.getElementById("submit-btn").textContent =
    "Next (" + selectedItems.length + ")";
}

// Remove item window function removes a name from the list of selected items
window.removeDevice = function (itemName) {
  removeDevice(itemName);
};

function removeDevice(itemName) {
    // Remove item from the list of reserved items
    selectedItems.splice(selectedItems.indexOf(itemName), 1);
    // Make the button green and change name to "Add"
    let button = document.getElementById(`button-${itemName}`);
    button.className = "btn btn-primary";
    button.innerHTML = "Add";
    // Change onclick function to addDevice
    button.onclick = function () {
      addDevice(itemName);
    };
    // Console log the list of reserved items
    console.log(selectedItems);
    // Update number of items reserved at submit button
    document.getElementById("submit-btn").textContent =
      "Next (" + selectedItems.length + ")";
}

// MakeResvRequest function (Sends the list of reserved items to the server)
window.nextWindow = function () {
  // Get the list of reserved items
  let resvItems = selectedItems;
  // Parse the list to json
  let resvItemsJson = JSON.stringify(resvItems);
  // Get start and end times from local storage
  let startTime = localStorage.getItem("startTime");
  let endTime = localStorage.getItem("endTime");
  // Make the request
  Reserve(resvItemsJson, startTime, endTime)
    .then(
      (response) => {
        // If the response is false, alert error and go back to times page
        if (response === false) {
          console.log(response);
          alert("Error: Could not reserve items");
          window.location.href = "times.html";
        }
        // If the response is true, go to home page
        else {
          alert("Success: Items reserved");
          window.location.href = "home.html";
        }
      }
      // If there is an error, alert error and go back to times page
    )
    .catch((err) => {
      console.log(response);
      alert("Error: Could not reserve items");
      window.location.href = "times.html";
    });
};
