package app.tailordeck;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class TailorDeckAlarmActivity extends Activity {
    private static Ringtone activeRingtone;
    private static Vibrator activeVibrator;
    private TailorDeckAlarmPayload payload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureWindow();
        payload = TailorDeckAlarmPayload.fromIntent(getIntent());
        if (payload == null) {
            finish();
            return;
        }

        startAlert();
        setContentView(buildLayout());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (isFinishing()) stopActiveAlarm();
    }

    @Override
    public void onBackPressed() {
        cancelAlarm();
    }

    static void stopActiveAlarm() {
        if (activeRingtone != null && activeRingtone.isPlaying()) {
            activeRingtone.stop();
        }
        activeRingtone = null;

        if (activeVibrator != null) {
            activeVibrator.cancel();
        }
        activeVibrator = null;
    }

    private void configureWindow() {
        Window window = getWindow();
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
    }

    private LinearLayout buildLayout() {
        int burgundy = Color.rgb(123, 30, 55);
        int gold = Color.rgb(201, 168, 76);
        int brown = Color.rgb(80, 61, 49);
        int cream = Color.rgb(250, 248, 245);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(24), dp(24), dp(24), dp(24));
        root.setBackgroundColor(cream);

        TextView logo = new TextView(this);
        logo.setText("TailorDeck");
        logo.setTextColor(burgundy);
        logo.setTextSize(28);
        logo.setTypeface(Typeface.DEFAULT_BOLD);
        logo.setGravity(Gravity.CENTER);
        root.addView(logo, matchWrap());

        TextView title = new TextView(this);
        title.setText("Job deadline alarm");
        title.setTextColor(Color.rgb(24, 12, 7));
        title.setTextSize(28);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, dp(32), 0, dp(10));
        root.addView(title, matchWrap());

        TextView body = new TextView(this);
        body.setText(payload.body == null || payload.body.isEmpty() ? "A TailorDeck job needs your attention." : payload.body);
        body.setTextColor(brown);
        body.setTextSize(19);
        body.setGravity(Gravity.CENTER);
        body.setLineSpacing(dp(3), 1.05f);
        root.addView(body, matchWrap());

        TextView reminder = new TextView(this);
        reminder.setText(payload.reminderLabel == null || payload.reminderLabel.isEmpty() ? "Deadline reminder" : payload.reminderLabel);
        reminder.setTextColor(gold);
        reminder.setTextSize(15);
        reminder.setTypeface(Typeface.DEFAULT_BOLD);
        reminder.setGravity(Gravity.CENTER);
        reminder.setPadding(0, dp(16), 0, dp(28));
        root.addView(reminder, matchWrap());

        LinearLayout firstRow = new LinearLayout(this);
        firstRow.setOrientation(LinearLayout.HORIZONTAL);
        firstRow.setGravity(Gravity.CENTER);
        firstRow.setPadding(0, 0, 0, dp(14));

        Button cancel = secondaryButton("Cancel");
        cancel.setOnClickListener(view -> cancelAlarm());
        firstRow.addView(cancel, weightedButton());

        Button snooze = secondaryButton("Snooze 15 min");
        snooze.setOnClickListener(view -> snoozeAlarm());
        firstRow.addView(snooze, weightedButton());
        root.addView(firstRow, matchWrap());

        Button complete = primaryButton("Mark job completed");
        complete.setOnClickListener(view -> completeJob());
        root.addView(complete, matchWrap());

        return root;
    }

    private void startAlert() {
        stopActiveAlarm();

        Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (alarmUri == null) alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        activeRingtone = RingtoneManager.getRingtone(this, alarmUri);
        if (activeRingtone != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) activeRingtone.setLooping(true);
            activeRingtone.play();
        }

        activeVibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (activeVibrator != null && activeVibrator.hasVibrator()) {
            long[] pattern = new long[] { 0, 700, 300, 700, 300, 1100 };
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                activeVibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } else {
                activeVibrator.vibrate(pattern, 0);
            }
        }
    }

    private void cancelAlarm() {
        stopActiveAlarm();
        TailorDeckAlarmScheduler.cancel(this, payload.id);
        finish();
    }

    private void snoozeAlarm() {
        stopActiveAlarm();
        TailorDeckAlarmScheduler.cancelNotification(this, payload.id);
        TailorDeckAlarmScheduler.snooze(this, payload);
        finish();
    }

    private void completeJob() {
        stopActiveAlarm();
        TailorDeckAlarmScheduler.cancel(this, payload.id);
        Intent intent = payload.putExtras(new Intent(this, MainActivity.class));
        intent.putExtra(TailorDeckAlarmPayload.EXTRA_ACTION, TailorDeckAlarmScheduler.EVENT_COMPLETE);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }

    private Button primaryButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(Color.WHITE);
        button.setTextSize(17);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setAllCaps(false);
        button.setBackgroundColor(Color.rgb(123, 30, 55));
        button.setPadding(dp(16), dp(12), dp(16), dp(12));
        return button;
    }

    private Button secondaryButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(Color.rgb(123, 30, 55));
        button.setTextSize(16);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setAllCaps(false);
        button.setPadding(dp(10), dp(12), dp(10), dp(12));
        return button;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private LinearLayout.LayoutParams weightedButton() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        params.setMargins(dp(6), 0, dp(6), 0);
        return params;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
