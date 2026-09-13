package app.tailordeck;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(TailorDeckAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
