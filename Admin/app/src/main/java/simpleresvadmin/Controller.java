package simpleresvadmin;

import javafx.fxml.FXML;
import javafx.scene.control.ListView;

import org.json.JSONArray;

public class Controller {
    @FXML
    // Make a javaFX list of items  
    protected ListView<String> itemsList;
    protected JSONArray items;
    public void refreshItems(Runnable listOnMouseClicked, String listID) throws Exception {
        try{
            // Clear the list
            itemsList.getItems().clear();
            // Get the items from the API
            this.items = this.getListItems();
            if (this.items == null){
                // JavaFX alert box and then exit
                javafx.scene.control.Alert alert = new javafx.scene.control.Alert(javafx.scene.control.Alert.AlertType.ERROR);
                alert.setTitle("Error");
                alert.setHeaderText("Error");
                alert.setContentText("Could not get items from the API");
                alert.showAndWait();
                System.exit(1);
                return;
            }
            // Get name of each item and add it to the list
            for (int i = 0; i < items.length(); i++) {
                // Add the item to the list and on click, show the details
                itemsList.getItems().add(items.getJSONObject(i).getString(listID));
                // On select, show the details
                itemsList.setOnMouseClicked(event -> listOnMouseClicked.run());
            }
        }
        catch (Exception e) {
            // Create alert box to show error
            // JavaFX alert box and then exit
            javafx.scene.control.Alert alert = new javafx.scene.control.Alert(javafx.scene.control.Alert.AlertType.ERROR);
            alert.setTitle("Error");
        }
    }
    // This must be defined and then overridden in the child class
    protected JSONArray getListItems() throws Exception {
        return null;
    }
}