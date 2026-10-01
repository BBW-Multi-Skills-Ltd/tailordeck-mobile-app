package app.tailordeck;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(TailorDeckAlarmPlugin.class);
        registerPlugin(TailorDeckBillingPlugin.class);
        super.onCreate(savedInstanceState);
        configureSystemBars();
    }

    private void configureSystemBars() {
        Window window = getWindow();
        int background = Color.parseColor("#FAF8F5");
        window.setStatusBarColor(background);
        window.setNavigationBarColor(background);

        int flags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        window.getDecorView().setSystemUiVisibility(flags);
    }
}
