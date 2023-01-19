package simpleresvadmin;

import API.API;
import javafx.fxml.FXML;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.text.Text;
import org.json.JSONArray;

public class ItemsController extends Controller {
    @FXML
    private Text detailStatus;
    @FXML
    private TextField detailName;
    @FXML
    private TextArea detailDescription;
    private Runnable listOnMouseClicked = () -> {
        int index = itemsList.getSelectionModel().getSelectedIndex();
        String name = items.getJSONObject(index).getString("name");
        String description = items.getJSONObject(index).getString("description");
        detailName.setText(name);
        detailDescription.setText(description);
        detailStatus.setText(items.getJSONObject(index).getString("status"));
    };

    public void refreshItems() throws Exception {
        super.refreshItems(listOnMouseClicked, "name");
    }

    @Override
    protected JSONArray getListItems() throws Exception {
        return API.getItems();
    }

    public void initialize() throws Exception {
        refreshItems(listOnMouseClicked, "name");
    }

    public void deleteItem() throws Exception {
        int index = itemsList.getSelectionModel().getSelectedIndex();
        String name = items.getJSONObject(index).getString("name");
        System.out.println(API.removeItem(name));
        refreshItems(listOnMouseClicked, "name");
    }
    public void addItem() throws Exception {
        String name = this.detailName.getText();
        String description = this.detailDescription.getText();
        if (API.addItem(name, description).equals("{  \"error\": \"item already exists\"}")){
            javafx.scene.control.Alert alert = new javafx.scene.control.Alert(javafx.scene.control.Alert.AlertType.ERROR);
            alert.setTitle("Error");
            alert.setHeaderText("Item already exists");
            alert.setContentText("The item " + name + " already exists");
            alert.showAndWait();
        }
        refreshItems(listOnMouseClicked, "name");
    }
}