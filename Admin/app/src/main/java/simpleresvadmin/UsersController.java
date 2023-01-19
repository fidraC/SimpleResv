package simpleresvadmin;

import API.API;
import javafx.fxml.FXML;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import org.json.JSONArray;

public class UsersController extends Controller {
    @FXML
    private TextField username;
    @FXML
    private TextField email;
    @FXML
    private TextField permissions;
    @FXML
    private PasswordField password;

    // Create anonymous function for listOnMouseClicked
    private Runnable listOnMouseClicked = () -> {
        // Get the selected item
        int index = itemsList.getSelectionModel().getSelectedIndex();
        // Get the details of the item
        String name = items.getJSONObject(index).getString("username");
        String description = items.getJSONObject(index).getString("email");
        // Set the details
        username.setText(name);
        email.setText(description);
        permissions.setText(items.getJSONObject(index).getString("permissions"));
        password.setText(items.getJSONObject(index).getString("hash"));
    };

    public void refreshItems() throws Exception {
        super.refreshItems(listOnMouseClicked, "username");
    }

    @Override
    protected JSONArray getListItems() throws Exception {
        // Get the list of items from the API
        return API.getUsers();
    }

    // Refresh on initialization
    public void initialize() throws Exception {
        refreshItems(listOnMouseClicked, "username");
    }
    // Add user
    public void addUser() throws Exception {
        // Get the name of the item
        String username = this.username.getText();
        String email = this.email.getText();
        String permissions = this.permissions.getText();
        String password = this.password.getText();
        // DEBUG
        System.out.println("Adding " + username);
        // Add the item
        System.out.println(API.registerUser(username, password, email, permissions));
        // Refresh the list
        refreshItems(listOnMouseClicked, "username");
    }
    // Delete user
    public void deleteUser() throws Exception {
        // Get the index of the selected item
        int index = itemsList.getSelectionModel().getSelectedIndex();
        // Get the id of the item
        String name = items.getJSONObject(index).getString("username");
        // DEBUG
        System.out.println("Deleting " + name);
        // Delete the item
        System.out.println(API.deleteUser(name));
        // Refresh the list
        refreshItems(listOnMouseClicked, "username");
    }
}