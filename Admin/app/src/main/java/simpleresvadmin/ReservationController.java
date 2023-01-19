package simpleresvadmin;

import org.json.JSONArray;

import API.API;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.ChoiceBox;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.text.Text;

public class ReservationController extends Controller {
    @FXML private ChoiceBox<String> Filter;
    @FXML private ListView<String> reservationsList;
    @FXML private TextField holder;
    @FXML private TextField item;
    @FXML private TextField startTime;
    @FXML private TextField endTime;
    @FXML private Text status;

    private Runnable listOnMouseClicked = () -> {
        // Get the selected item
        int index = reservationsList.getSelectionModel().getSelectedIndex();
        // if index is -1, then no item is selected
        if (index == -1) {
            return;
        }
        // Set the details
        holder.setText(items.getJSONObject(index).getString("username"));
        item.setText(items.getJSONObject(index).getString("item"));
        startTime.setText(items.getJSONObject(index).getString("start_time"));
        endTime.setText(items.getJSONObject(index).getString("end_time"));
        status.setText(items.getJSONObject(index).getString("status"));
    };

    // initialize the filter
    public void initialize() throws Exception {
        // Define the filter options as a raylist
        ObservableList<String> filterOptions = FXCollections.observableArrayList(
                "all",
                "pending",
                "overdue",
                "lent"
        );
        // Set the filter options
        Filter.setItems(filterOptions);
        // Set the default filter
        Filter.setValue("all");
        // On change, refresh the list
        Filter.getSelectionModel().selectedItemProperty().addListener((v, oldValue, newValue) -> {
            try {
                refreshReservations();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        refreshReservations();
    }
    @Override
    protected JSONArray getListItems() throws Exception {
        // Get the list of items from the API
        return API.getReservations();
    }
    public void refreshReservations() throws Exception {
        try{
            Runnable listOnMouseClicked = this.listOnMouseClicked;
            // Clear the list
            reservationsList.getItems().clear();
            // Get the items from the API
            this.items = this.getListItems();
            // Switch case for the filter
            if (Filter.getValue() == "all"){
                // do nothing
            }
            else if (Filter.getValue() == "overdue"){
                // Get overdue items from API
                this.items = API.getOverdueReservations();
            } 
            else{
                // Loop through items
                for (int i = 0; i < items.length(); i++) {
                    // If the item is not the filter, remove it
                    if (!items.getJSONObject(i).getString("status").equals(Filter.getValue())) {
                        items.remove(i);
                        i--;
                    }
                }
            }
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
                reservationsList.getItems().add(Integer.toString(items.getJSONObject(i).getInt("id")) + ": " + items.getJSONObject(i).getString("item") + " - " + items.getJSONObject(i).getString("username"));
                // On select, show the details
                reservationsList.setOnMouseClicked(event -> listOnMouseClicked.run());
            }
        } catch (Exception e) {
            // Create alert box to show error
            // JavaFX alert box and then exit
            javafx.scene.control.Alert alert = new javafx.scene.control.Alert(javafx.scene.control.Alert.AlertType.ERROR);
            alert.setTitle("Error");
        }
    }

    public void lend(){
        // Get the selected item
        int index = reservationsList.getSelectionModel().getSelectedIndex();
        // if index is -1, then no item is selected
        if (index == -1) {
            return;
        }
        // Get the id of the item
        int id = items.getJSONObject(index).getInt("id");
        // Try to lend the item
        try {
            System.out.println(API.lendReservation(Integer.toString(id)));
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Refresh the list
        try {
            refreshReservations();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void returnReservation(){
        // Get the selected item
        int index = reservationsList.getSelectionModel().getSelectedIndex();
        // if index is -1, then no item is selected
        if (index == -1) {
            return;
        }
        // Get the id of the item
        int id = items.getJSONObject(index).getInt("id");
        // Try to return the item
        try {
            System.out.println(API.returnReservation(Integer.toString(id)));
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Refresh the list
        try {
            refreshReservations();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
