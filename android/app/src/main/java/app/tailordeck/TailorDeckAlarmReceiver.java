package app.tailordeck;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class TailorDeckAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        TailorDeckAlarmPayload payload = TailorDeckAlarmPayload.fromIntent(intent);
        if (payload == null) return;

        String action = intent.getAction();
        if (TailorDeckAlarmScheduler.ACTION_CANCEL.equals(action)) {
            TailorDeckAlarmActivity.stopActiveAlarm();
            TailorDeckAlarmScheduler.cancel(context, payload.id);
            return;
        }

        if (TailorDeckAlarmScheduler.ACTION_SNOOZE.equals(action)) {
            TailorDeckAlarmActivity.stopActiveAlarm();
            TailorDeckAlarmScheduler.cancelNotification(context, payload.id);
            TailorDeckAlarmScheduler.snooze(context, payload);
            return;
        }

        if (TailorDeckAlarmScheduler.ACTION_COMPLETE.equals(action)) {
            TailorDeckAlarmActivity.stopActiveAlarm();
            TailorDeckAlarmScheduler.cancel(context, payload.id);
            try {
                TailorDeckAlarmScheduler.buildMainActivityIntent(context, TailorDeckAlarmScheduler.EVENT_COMPLETE, payload).send();
            } catch (android.app.PendingIntent.CanceledException ignored) {
                // If Android cancels the intent, the user can still open the app manually.
            }
            return;
        }

        if (TailorDeckAlarmScheduler.ACTION_OPEN.equals(action)) {
            TailorDeckAlarmActivity.stopActiveAlarm();
            TailorDeckAlarmScheduler.cancelNotification(context, payload.id);
            try {
                TailorDeckAlarmScheduler.buildMainActivityIntent(context, TailorDeckAlarmScheduler.EVENT_OPEN, payload).send();
            } catch (android.app.PendingIntent.CanceledException ignored) {
                // If Android cancels the intent, the user can still open the app manually.
            }
            return;
        }

        TailorDeckAlarmScheduler.showAlarmNotification(context, payload);
    }
}
