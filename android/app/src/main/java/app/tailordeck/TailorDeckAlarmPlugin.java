package app.tailordeck;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "TailorDeckAlarm")
public class TailorDeckAlarmPlugin extends Plugin {
    @Override
    public void load() {
        handleAlarmIntent(getActivity().getIntent());
    }

    @PluginMethod
    public void scheduleAlarms(PluginCall call) {
        if (!TailorDeckAlarmScheduler.canScheduleExact(getContext())) {
            call.reject("Exact alarm permission is not granted.");
            return;
        }

        JSArray alarms = call.getArray("alarms");
        TailorDeckAlarmScheduler.clearAll(getContext());

        if (alarms == null) {
            call.resolve();
            return;
        }

        long now = System.currentTimeMillis();
        int scheduled = 0;
        for (int index = 0; index < alarms.length(); index += 1) {
            try {
                JSONObject alarm = alarms.getJSONObject(index);
                TailorDeckAlarmPayload payload = TailorDeckAlarmPayload.fromJson(alarm);
                if (payload.fireAt <= now + 5000) continue;
                TailorDeckAlarmScheduler.schedule(getContext(), payload);
                scheduled += 1;
            } catch (JSONException ignored) {
                // Skip malformed alarms while keeping valid reminders scheduled.
            }
        }

        JSObject result = new JSObject();
        result.put("scheduled", scheduled);
        call.resolve(result);
    }

    @PluginMethod
    public void clearAlarms(PluginCall call) {
        TailorDeckAlarmScheduler.clearAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void checkExactAlarmPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.S);
        result.put("granted", TailorDeckAlarmScheduler.canScheduleExact(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            try {
                getActivity().startActivity(intent);
            } catch (RuntimeException ignored) {
                // Some Android builds hide this settings screen. The app will fall back to strong notifications.
            }
        }
        call.resolve();
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        handleAlarmIntent(intent);
    }

    private void handleAlarmIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getStringExtra(TailorDeckAlarmPayload.EXTRA_ACTION);
        TailorDeckAlarmPayload payload = TailorDeckAlarmPayload.fromIntent(intent);
        if (action == null || payload == null) return;

        JSObject event = new JSObject();
        event.put("action", action);
        event.put("jobId", payload.jobId);
        event.put("id", payload.id);
        notifyListeners("alarmAction", event, true);

        intent.removeExtra(TailorDeckAlarmPayload.EXTRA_ACTION);
        intent.removeExtra(TailorDeckAlarmPayload.EXTRA_ID);
        intent.removeExtra(TailorDeckAlarmPayload.EXTRA_JOB_ID);
    }
}
