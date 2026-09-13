package app.tailordeck;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONException;

class TailorDeckAlarmScheduler {
    static final String ACTION_ALARM_DUE = "app.tailordeck.ALARM_DUE";
    static final String ACTION_OPEN = "app.tailordeck.ALARM_OPEN";
    static final String ACTION_CANCEL = "app.tailordeck.ALARM_CANCEL";
    static final String ACTION_SNOOZE = "app.tailordeck.ALARM_SNOOZE";
    static final String ACTION_COMPLETE = "app.tailordeck.ALARM_COMPLETE";
    static final String EVENT_OPEN = "open";
    static final String EVENT_CANCEL = "cancel";
    static final String EVENT_SNOOZE = "snooze";
    static final String EVENT_COMPLETE = "complete";
    private static final String PREFS_NAME = "tailordeck_alarm_store";
    private static final String IDS_KEY = "alarm_ids";
    private static final String ALARM_KEY_PREFIX = "alarm_";
    private static final String CHANNEL_ID = "tailordeck-full-screen-alarms-v1";
    private static final long SNOOZE_MILLIS = 15L * 60L * 1000L;

    static boolean canScheduleExact(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        return alarmManager != null && alarmManager.canScheduleExactAlarms();
    }

    static void schedule(Context context, TailorDeckAlarmPayload payload) {
        if (!canScheduleExact(context)) return;

        storePayload(context, payload);
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        PendingIntent pendingIntent = buildBroadcastIntent(context, ACTION_ALARM_DUE, payload);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, payload.fireAt, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, payload.fireAt, pendingIntent);
        }
    }

    static void snooze(Context context, TailorDeckAlarmPayload payload) {
        schedule(context, payload.snoozed(System.currentTimeMillis() + SNOOZE_MILLIS));
    }

    static void cancel(Context context, int id) {
        TailorDeckAlarmPayload payload = getPayload(context, id);
        if (payload != null) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                alarmManager.cancel(buildBroadcastIntent(context, ACTION_ALARM_DUE, payload));
            }
        }
        removePayload(context, id);
        cancelNotification(context, id);
    }

    static void clearAll(Context context) {
        for (int id : getStoredIds(context)) {
            cancel(context, id);
        }
    }

    static TailorDeckAlarmPayload getPayload(Context context, int id) {
        String raw = prefs(context).getString(ALARM_KEY_PREFIX + id, null);
        if (raw == null) return null;
        try {
            return TailorDeckAlarmPayload.fromJson(new org.json.JSONObject(raw));
        } catch (JSONException error) {
            removePayload(context, id);
            return null;
        }
    }

    static void showAlarmNotification(Context context, TailorDeckAlarmPayload payload) {
        ensureChannel(context);

        Intent fullScreenIntent = payload.putExtras(new Intent(context, TailorDeckAlarmActivity.class));
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            payload.id,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_tailordeck)
            .setLargeIcon(BitmapFactory.decodeResource(context.getResources(), R.drawable.ic_notification_tailordeck_large))
            .setContentTitle(payload.title)
            .setContentText(payload.body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(payload.largeBody))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(false)
            .setOngoing(true)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(buildMainActivityIntent(context, EVENT_OPEN, payload))
            .addAction(R.drawable.ic_stat_tailordeck, "Cancel", buildBroadcastIntent(context, ACTION_CANCEL, payload))
            .addAction(R.drawable.ic_stat_tailordeck, "Snooze 15 min", buildBroadcastIntent(context, ACTION_SNOOZE, payload))
            .addAction(R.drawable.ic_stat_tailordeck, "Mark completed", buildBroadcastIntent(context, ACTION_COMPLETE, payload));

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify(payload.id, builder.build());
        }

        Intent activityIntent = payload.putExtras(new Intent(context, TailorDeckAlarmActivity.class));
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        try {
            context.startActivity(activityIntent);
        } catch (RuntimeException ignored) {
            // Some Android builds block background activity starts; the full-screen notification remains available.
        }
    }

    static PendingIntent buildMainActivityIntent(Context context, String action, TailorDeckAlarmPayload payload) {
        Intent intent = payload.putExtras(new Intent(context, MainActivity.class));
        intent.putExtra(TailorDeckAlarmPayload.EXTRA_ACTION, action);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(
            context,
            payload.id + action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    static void cancelNotification(Context context, int id) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) notificationManager.cancel(id);
    }

    static Set<Integer> getStoredIds(Context context) {
        Set<String> rawIds = prefs(context).getStringSet(IDS_KEY, new HashSet<>());
        Set<Integer> ids = new HashSet<>();
        for (String rawId : rawIds) {
            try {
                ids.add(Integer.parseInt(rawId));
            } catch (NumberFormatException ignored) {
                // Ignore malformed ids from previous app versions.
            }
        }
        return ids;
    }

    private static PendingIntent buildBroadcastIntent(Context context, String action, TailorDeckAlarmPayload payload) {
        Intent intent = payload.putExtras(new Intent(context, TailorDeckAlarmReceiver.class));
        intent.setAction(action);
        return PendingIntent.getBroadcast(
            context,
            payload.id + action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.tailordeck_reminder);
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();

        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "TailorDeck deadline alarms", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Full-screen TailorDeck job deadline alarms.");
        channel.setSound(soundUri, audioAttributes);
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] { 0, 700, 300, 700, 300, 1100 });
        channel.enableLights(true);
        channel.setLightColor(0xFF7B1E37);
        channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) notificationManager.createNotificationChannel(channel);
    }

    private static void storePayload(Context context, TailorDeckAlarmPayload payload) {
        try {
            SharedPreferences prefs = prefs(context);
            Set<String> ids = new HashSet<>(prefs.getStringSet(IDS_KEY, new HashSet<>()));
            ids.add(String.valueOf(payload.id));
            prefs.edit()
                .putStringSet(IDS_KEY, ids)
                .putString(ALARM_KEY_PREFIX + payload.id, payload.toJson().toString())
                .apply();
        } catch (JSONException ignored) {
            // Invalid payloads are skipped instead of crashing the app.
        }
    }

    private static void removePayload(Context context, int id) {
        SharedPreferences prefs = prefs(context);
        Set<String> ids = new HashSet<>(prefs.getStringSet(IDS_KEY, new HashSet<>()));
        ids.remove(String.valueOf(id));
        prefs.edit().putStringSet(IDS_KEY, ids).remove(ALARM_KEY_PREFIX + id).apply();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
