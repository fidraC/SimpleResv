package main

import (
	"context"
	"encoding/json"
	"fmt"

	helper "github.com/acheong08/SimpleResv/Client/helpers"
)

// App struct
type App struct {
	ctx      context.Context
	username string
	password string
	settings helper.Settings
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	// Set context
	a.ctx = ctx
	// Add settings object to the app
	a.settings = helper.Settings{}
	// Init settings
	a.settings.Init()

}

// Shutdown is called when the app is closing
// When shutdown occurs, settings are saved
func (a *App) shutdown(ctx context.Context) {
	a.settings.Save()
}

// Login takes a username and password and returns a bool indicating if the login was successful
func (a *App) Login(username string, password string) bool {
	loginStatus, err := helper.LoginRequest(username, password)
	if err != nil {
		return false
	}
	// If successful, store username and password and return true
	if loginStatus {
		// Store username and password in settings
		a.settings.SetAuth(username, password)
		return true
	}
	// If not successful, return false
	return false
}

// Items takes a start and end time and returns a json list of items
func (a *App) Items(start string, end string) string {
	items, err := helper.GetItemsRequest(start, end)
	if err != nil {
		fmt.Println(err)
		// Return error as json
		return `{'status': 'error', "error": "` + err.Error() + `"}`
	}
	return items
}

// Reserve takes a json list of devices and makes a reservation request for each item
func (a *App) Reserve(items string, startTime string, endTime string) bool {
	// parse json string into array of string
	var itemsArray []string
	err := json.Unmarshal([]byte(items), &itemsArray)
	if err != nil {
		fmt.Println(err)
		return false
	}
	// Loop through each item in the map
	for _, item := range itemsArray {
		// Make the reservation request
		reserveStatus, err := helper.ReserveRequest(a.settings.Info.Username, a.settings.Info.Password, item, startTime, endTime)
		if err != nil {
			fmt.Println(err)
			return false
		}
		// If not successful, return false
		if !reserveStatus {
			return false
		}
	}
	return true
}

// Get Reservations authenticates and returns a json list of reservations for the user
func (a *App) Reservations() string {
	reservations, err := helper.GetReservationRequest(a.settings.Info.Username, a.settings.Info.Password)
	if err != nil {
		fmt.Println(err)
		// Return error as json
		return `{'status': 'error', "error": "` + err.Error() + `"}`
	}
	return reservations
}

// Cancel takes a json list of reservations and cancels each reservation
func (a *App) Cancel(reservations string) bool {
	// parse json string into array of string
	var reservationsArray []string
	err := json.Unmarshal([]byte(reservations), &reservationsArray)
	if err != nil {
		fmt.Println(err)
		return false
	}
	// Loop through each reservation in the map
	for _, reservation := range reservationsArray {
		// Cancel the reservation
		cancelStatus, err := helper.CancelReservationRequest(a.settings.Info.Username, a.settings.Info.Password, reservation)
		if err != nil {
			fmt.Println(err)
			return false
		}
		// If not successful, return false
		if !cancelStatus {
			return false
		}
	}
	return true
}

// Setting gets the JSON config for the app
func (a *App) Setting() string {
	return a.settings.GetConfig()
}

// AddFavoriteTimes adds name, start, and end to the favorite times list
func (a *App) AddFavoriteTime(name string, start string, end string) bool {
	return a.settings.AddTime(name, start, end)
}

// DeleteFavoriteTime deletes a favorite time from the list
func (a *App) DeleteFavoriteTime(name string) bool {
	return a.settings.DeleteTime(name)
}

// AddFavoriteItems takes a json list of items and name and adds them to the favorite items list
func (a *App) AddFavoriteItems(name string, items string) bool {
	// Parse json string into array of helper.Item
	var itemsArray []helper.Item
	err := json.Unmarshal([]byte(items), &itemsArray)
	if err != nil {
		fmt.Println(err)
		return false
	}
	return a.settings.AddItemGroup(name, itemsArray)
}

// DeleteFavoriteItems deletes a favorite item group from the list
func (a *App) DeleteFavoriteItems(name string) bool {
	return a.settings.DeleteItemGroup(name)
}
