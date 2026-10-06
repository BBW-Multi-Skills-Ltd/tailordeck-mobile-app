package app.tailordeck;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(TailorDeckAlarmPlugin.class);
        registerPlugin(TailorDeckBillingPlugin.class);
        super.onCreate(savedInstanceState);
        configureSystemBars();
        keepContentAboveKeyboard();
    }

    /**
     * Android 15+ draws apps edge-to-edge and no longer resizes them for the keyboard (adjustResize is ignored),
     * so the keyboard covered inputs and the wizard's Next/Save buttons. Shrink the content by the keyboard height.
     * Older Android versions are handled by windowSoftInputMode="adjustResize" in the manifest.
     */
    private void keepContentAboveKeyboard() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) return;

        View content = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, insets) -> {
            int keyboardBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom;
            int navigationBottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
            // The web layout already pads for the navigation bar (safe-area CSS), so only add the extra keyboard height.
            int extra = insets.isVisible(WindowInsetsCompat.Type.ime()) ? Math.max(0, keyboardBottom - navigationBottom) : 0;
            view.setPadding(view.getPaddingLeft(), view.getPaddingTop(), view.getPaddingRight(), extra);
            return insets;
        });
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
