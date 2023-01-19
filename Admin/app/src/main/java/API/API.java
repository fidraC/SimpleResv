package API;
// Import http libraries
import java.net.*;
import java.io.*;
import java.util.*;
import org.json.JSONObject;
import org.json.JSONArray;

public class API {
    private static String endpointRoot = "http://127.0.0.1:6969/";
    public static String username;
    public static String password;

    private static String getRequest(String url_path) throws Exception{
        // Create a URL object
        URL url = new URL(endpointRoot + url_path);
        // Create a connection
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        // Set the request method
        con.setRequestMethod("GET");
        // Set request type as plain text
        con.setRequestProperty("Content-Type", "text/html");
        // Get the response code
        int status = con.getResponseCode();
        // If the response code is not 200, throw an error
        if (status != 200) {
            throw new RuntimeException("HTTP GET Request Failed with Error code : " + status);
        }
        // Get the response
        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        // Return the response
        return response.toString();
    }
    // Method to get all items from the API and return them as a JSON array
    public static JSONArray getItems() throws Exception {
        // Return the response as a string
        String jsonOutput = getRequest("items");
        // Parse the JSON string
        JSONObject obj = new JSONObject(jsonOutput);
        // Get the items array
        JSONArray items = obj.getJSONArray("items");
        // Return the items array
        return items;
    }
    private static String postRequest(String url_path, StringBuilder postData) throws Exception{
        // Create a URL object from the endpoint
        URL url = new URL(endpointRoot + url_path);
        // Create a connection object
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        // Set the request method to POST
        con.setRequestMethod("POST");
        // Set the request property to application/x-www-form-urlencoded
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        // Set the request property to true to allow output
        con.setDoOutput(true);
        // Create a data output stream to write the form data to the connection
        DataOutputStream dos = new DataOutputStream(con.getOutputStream());
        // Write the form data to the connection
        dos.writeBytes(postData.toString());
        // Flush the data output stream
        dos.flush();
        // Close the data output stream
        dos.close();
        // Get the response code
        int status = con.getResponseCode();
        // If the response code is not 200, throw an exception
        if (status != 200) {
            throw new Exception("Error: " + status);
        }
        // Create a scanner object to read the response
        Scanner sc = new Scanner(con.getInputStream());
        // Create a string builder to store the response
        StringBuilder sb = new StringBuilder();
        // While there is more to read, append it to the string builder
        while (sc.hasNext()) {
            sb.append(sc.nextLine());
        }
        // Close the scanner
        sc.close();
        // Return the response as a string
        return sb.toString();
    }

    public static String removeItem(String name) throws Exception {
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&name=" + name);
        return postRequest("admin/remove_item", sb);
 
    }
    // Add item
    public static String addItem(String name, String description) throws Exception {
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&name=" + name);
        sb.append("&description=" + description);
        return postRequest("admin/add_item", sb);
    }

    // Method to get all reservations from the API and return them as a JSON array
    // Requires authentication with username and password as form data
    // It is a POST request
    public static JSONArray getReservations() throws Exception {
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        String response = getRequest("reservations" + "?" + sb.toString());
        JSONObject obj = new JSONObject(response);
        return obj.getJSONArray("reservations");
    }

    public static JSONArray getOverdueReservations() throws Exception{
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        String response = postRequest("admin/overdue", sb);
        System.out.println(response);
        JSONObject obj = new JSONObject(response);
        return obj.getJSONArray("overdue_reservations");
    }

    // Lend reservation
    public static String lendReservation(String id) throws Exception {
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&reservation_id=" + id);
        return postRequest("admin/lend", sb);
    }

    // Return reservation
    public static String returnReservation(String id) throws Exception{
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&reservation_id=" + id);
        return postRequest("admin/return", sb);
    }
    // Get users
    // Uses post request
    public static JSONArray getUsers() throws Exception {
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        String response = postRequest("admin/users", sb);
        JSONObject obj = new JSONObject(response);
        return obj.getJSONArray("users");
    }
    // Register user
    public static String registerUser(String new_username, String new_password, String new_email, String new_permissions) throws Exception {
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&new_username=" + new_username);
        sb.append("&new_password=" + new_password);
        sb.append("&new_email=" + new_email);
        sb.append("&new_permissions=" + new_permissions);
        return postRequest("admin/register", sb);
    }
    // delete user
    public static String deleteUser(String id) throws Exception {
        // Create a string builder to store the form data
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        sb.append("&username_to_delete=" + id);
        return postRequest("admin/delete_user", sb);
    }
    public static boolean login(String username, String password){
        StringBuilder sb = new StringBuilder();
        // Append the username and password to the string builder
        sb.append("username=" + username);
        sb.append("&password=" + password);
        // POST request
        try {
            String response = postRequest("login", sb);
            JSONObject obj = new JSONObject(response);
            if (obj.getString("status").equals("success") && obj.getString("permissions").equals("admin")){
                return true;
            } else{
                return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
