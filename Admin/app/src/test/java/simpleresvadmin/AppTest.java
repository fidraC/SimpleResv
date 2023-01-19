/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package simpleresvadmin;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import API.API;

class AppTest {
    @Test void getItems() {
        try {
            assertNotNull(API.getItems(), "Items should not be null");
            assertNull(null, "Null should be null");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test void getReservations(){
        try {
            assertNotNull(API.getReservations(), "Reservations should not be null");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}