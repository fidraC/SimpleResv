package helpers

import (
	"encoding/json"
	"os"
)

type SettingsInfo struct {
	Username           string      `json:"username"`
	Password           string      `json:"password"`
	FavoriteItemGroups []ItemGroup `json:"favorite_item_groups"`
	FavoriteTimes      []Times     `json:"favorite_times"`
}

type Item struct {
	Name string `json:"name"`
}

type ItemGroup struct {
	Name  string `json:"name"`
	Items []Item `json:"items"`
}

type Times struct {
	Name  string `json:"name"`
	Start string `json:"start"`
	End   string `json:"end"`
}

// Settings type for storing settings
type Settings struct {
	Info SettingsInfo
	Path string
}

// InitSettings initializes the settings struct
func (s *Settings) Init() {
	// Set path
	s.Path, _ = os.UserHomeDir()
	s.Path += "/.simpleresv/settings.json"
	// If path does not exist, create it
	if _, err := os.Stat(s.Path); os.IsNotExist(err) {
		os.MkdirAll(s.Path[:len(s.Path)-len(s.Path[len(s.Path)-1:])], 0755)
		os.Create(s.Path)
	}
	// If path exists, load it
	if _, err := os.Stat(s.Path); !os.IsNotExist(err) {
		s.Load()
	}
}

// SetAuth sets the username and password
func (s *Settings) SetAuth(username string, password string) {
	s.Info.Username = username
	s.Info.Password = password
}

// Save converts the settings struct to json and writes it to the settings file
func (s *Settings) Save() {
	// Convert to json
	json, err := json.Marshal(s.Info)
	if err != nil {
		panic(err)
	}
	// Write to file
	file, err := os.Create(s.Path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	file.Write(json)
}

// Load reads the settings file and sets the settings struct to the contents of the file
func (s *Settings) Load() {
	// Read from file
	file, err := os.Open(s.Path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	// Read contents into struct
	json.NewDecoder(file).Decode(&s.Info)
}

// GetConfig returns the settings JSON
func (s *Settings) GetConfig() string {
	// Convert to json
	info, err := json.Marshal(s.Info)
	if err != nil {
		panic(err)
	}
	return string(info)
}

// Add time to favorite times
func (s *Settings) AddTime(name string, start string, end string) bool {
	s.Info.FavoriteTimes = append(s.Info.FavoriteTimes, Times{Name: name, Start: start, End: end})
	return true
}

// Delete time from favorite times
func (s *Settings) DeleteTime(name string) bool {
	for i, t := range s.Info.FavoriteTimes {
		if t.Name == name {
			s.Info.FavoriteTimes = append(s.Info.FavoriteTimes[:i], s.Info.FavoriteTimes[i+1:]...)
			return true
		}
	}
	return false
}

// Add list of items to favorite items
func (s *Settings) AddItemGroup(name string, items []Item) bool {
	// Check if item group already exists
	for _, g := range s.Info.FavoriteItemGroups {
		if g.Name == name {
			g.Items = items
			return true
		}
	}
	// If not, create it
	s.Info.FavoriteItemGroups = append(s.Info.FavoriteItemGroups, ItemGroup{Name: name, Items: items})
	return true
}

// Remove item group
func (s *Settings) DeleteItemGroup(name string) bool {
	for i, g := range s.Info.FavoriteItemGroups {
		if g.Name == name {
			s.Info.FavoriteItemGroups = append(s.Info.FavoriteItemGroups[:i], s.Info.FavoriteItemGroups[i+1:]...)
			return true
		}
	}
	return false
}
