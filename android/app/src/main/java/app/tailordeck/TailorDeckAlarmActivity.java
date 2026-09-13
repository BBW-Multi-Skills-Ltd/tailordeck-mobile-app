package app.tailordeck;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
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

    private View buildLayout() {
        int burgundy = Color.rgb(123, 30, 55);
        int gold = Color.rgb(201, 168, 76);
        int brown = Color.rgb(80, 61, 49);
        int cream = Color.rgb(250, 248, 245);
        int ink = Color.rgb(24, 12, 7);
        int muted = Color.rgb(139, 122, 112);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(cream);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(26), dp(34), dp(26), dp(34));
        scroll.addView(root, new ScrollView.LayoutParams(ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.MATCH_PARENT));

        ImageView logoIcon = new ImageView(this);
        logoIcon.setImageResource(R.mipmap.ic_launcher);
        logoIcon.setAdjustViewBounds(true);
        logoIcon.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        root.addView(logoIcon, squareParams(86));

        TextView brand = new TextView(this);
        brand.setText("TailorDeck");
        brand.setTextColor(burgundy);
        brand.setTextSize(30);
        brand.setTypeface(Typeface.DEFAULT_BOLD);
        brand.setGravity(Gravity.CENTER);
        brand.setPadding(0, dp(16), 0, 0);
        root.addView(brand, matchWrap());

        TextView eyebrow = new TextView(this);
        eyebrow.setText("DEADLINE ALERT");
        eyebrow.setTextColor(gold);
        eyebrow.setTextSize(12);
        eyebrow.setTypeface(Typeface.DEFAULT_BOLD);
        eyebrow.setLetterSpacing(0.12f);
        eyebrow.setGravity(Gravity.CENTER);
        eyebrow.setPadding(0, dp(8), 0, dp(22));
        root.addView(eyebrow, matchWrap());

        TextView title = new TextView(this);
        title.setText("Job deadline alarm");
        title.setTextColor(ink);
        title.setTextSize(27);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, dp(12));
        root.addView(title, matchWrap());

        TextView body = new TextView(this);
        body.setText(payload.body == null || payload.body.isEmpty() ? "A TailorDeck job needs your attention." : payload.body);
        body.setTextColor(brown);
        body.setTextSize(20);
        body.setGravity(Gravity.CENTER);
        body.setLineSpacing(dp(3), 1.05f);
        root.addView(body, matchWrap());

        TextView reminder = new TextView(this);
        reminder.setText(payload.reminderLabel == null || payload.reminderLabel.isEmpty() ? "Deadline reminder" : payload.reminderLabel);
        reminder.setTextColor(burgundy);
        reminder.setTextSize(15);
        reminder.setTypeface(Typeface.DEFAULT_BOLD);
        reminder.setGravity(Gravity.CENTER);
        reminder.setPadding(dp(16), dp(9), dp(16), dp(9));
        reminder.setBackground(roundedStroke(Color.rgb(253, 249, 243), dp(999), Color.rgb(224, 196, 126), dp(1)));
        LinearLayout.LayoutParams reminderParams = wrapCentered();
        reminderParams.setMargins(0, dp(20), 0, dp(28));
        root.addView(reminder, reminderParams);

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

        TextView hint = new TextView(this);
        hint.setText("Cancel only stops this alarm. Mark completed updates the job.");
        hint.setTextColor(muted);
        hint.setTextSize(13);
        hint.setGravity(Gravity.CENTER);
        hint.setPadding(0, dp(18), 0, 0);
        root.addView(hint, matchWrap());

        return scroll;
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
        button.setBackground(rounded(Color.rgb(151, 28, 72), dp(18)));
        button.setElevation(dp(10));
        button.setMinHeight(0);
        button.setMinWidth(0);
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
        button.setBackground(roundedStroke(Color.rgb(255, 253, 250), dp(18), Color.rgb(226, 204, 214), dp(1)));
        button.setElevation(dp(8));
        button.setMinHeight(0);
        button.setMinWidth(0);
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

    private LinearLayout.LayoutParams squareParams(int sizeDp) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(sizeDp), dp(sizeDp));
        params.gravity = Gravity.CENTER;
        return params;
    }

    private LinearLayout.LayoutParams wrapCentered() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.gravity = Gravity.CENTER;
        return params;
    }

    private GradientDrawable rounded(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(radius);
        return drawable;
    }

    private GradientDrawable roundedStroke(int color, int radius, int strokeColor, int strokeWidth) {
        GradientDrawable drawable = rounded(color, radius);
        drawable.setStroke(strokeWidth, strokeColor);
        return drawable;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
