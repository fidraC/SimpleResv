package simpleresvadmin;

// Uses fxml files to create the GUI
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.*;
import javafx.stage.Stage;
import javafx.scene.control.Dialog;
import javafx.scene.control.ButtonType;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;

import API.API;

public class Main extends Application {
    @Override
    public void start(Stage stage) throws Exception {
        // FXML get the GUI from the fxml file at resources/admin.fxml
        // Check if the fxml file exists
        if (getClass().getResource("/admin.fxml") == null) {
            System.out.println("FXML file not found");
            return;
        }
        // JavaFX login dialog (Not using FXML)
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Login");
        dialog.setHeaderText("Enter your username and password");
        HBox hbox = new HBox();
        // Form for username and password
        TextField username = new TextField();
        username.setPromptText("Username");
        TextField password = new TextField();
        password.setPromptText("Password");
        // Add the form to the hbox and the hbox to the dialog
        hbox.getChildren().addAll(username, password);
        dialog.getDialogPane().setContent(hbox);
        // Add the buttons to the dialog
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        // Show the dialog and wait for the user to click a button
        dialog.showAndWait();
        // If the user clicked OK, check the username and password
        if (dialog.getResult() == ButtonType.OK) {
            // If the username and password are correct, load the GUI
            if (API.login(username.getText(), password.getText())) {
                // Save the credentials for later
                API.username = username.getText();
                API.password = password.getText();
                // Load the fxml file
                Parent root = FXMLLoader.load(getClass().getResource("/admin.fxml"));
                Scene scene = new Scene(root);
                stage.setScene(scene);
                stage.show();
            }
            // If the username and password are incorrect, show an error message
            else {
                System.out.println("Incorrect username or password");
                // Error dialog
                Dialog<ButtonType> errorDialog = new Dialog<>();
                errorDialog.setTitle("Error");
                errorDialog.setHeaderText("Incorrect username or password");
                errorDialog.getDialogPane().getButtonTypes().add(ButtonType.OK);
                errorDialog.showAndWait();
            }
        }
    }

    public static void main() {
        launch();
    }
}