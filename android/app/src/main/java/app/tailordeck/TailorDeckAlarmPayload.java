package app.tailordeck;

import android.content.Intent;
import org.json.JSONException;
import org.json.JSONObject;

class TailorDeckAlarmPayload {
    static final String EXTRA_ID = "tailordeck_alarm_id";
    static final String EXTRA_JOB_ID = "tailordeck_job_id";
    static final String EXTRA_TITLE = "tailordeck_alarm_title";
    static final String EXTRA_BODY = "tailordeck_alarm_body";
    static final String EXTRA_LARGE_BODY = "tailordeck_alarm_large_body";
    static final String EXTRA_REMINDER_LABEL = "tailordeck_alarm_reminder_label";
    static final String EXTRA_FIRE_AT = "tailordeck_alarm_fire_at";
    static final String EXTRA_ACTION = "tailordeck_alarm_action";

    final int id;
    final String jobId;
    final String title;
    final String body;
    final String largeBody;
    final String reminderLabel;
    final long fireAt;

    TailorDeckAlarmPayload(int id, String jobId, String title, String body, String largeBody, String reminderLabel, long fireAt) {
        this.id = id;
        this.jobId = jobId;
        this.title = title;
        this.body = body;
        this.largeBody = largeBody;
        this.reminderLabel = reminderLabel;
        this.fireAt = fireAt;
    }

    static TailorDeckAlarmPayload fromJson(JSONObject json) throws JSONException {
        return new TailorDeckAlarmPayload(
            json.getInt("id"),
            json.getString("jobId"),
            json.optString("title", "TailorDeck reminder"),
            json.optString("body", "A job deadline needs your attention."),
            json.optString("largeBody", "Open TailorDeck to view this job."),
            json.optString("reminderLabel", "Deadline reminder"),
            json.getLong("fireAt")
        );
    }

    static TailorDeckAlarmPayload fromIntent(Intent intent) {
        if (intent == null || !intent.hasExtra(EXTRA_ID) || !intent.hasExtra(EXTRA_JOB_ID)) return null;

        return new TailorDeckAlarmPayload(
            intent.getIntExtra(EXTRA_ID, 0),
            intent.getStringExtra(EXTRA_JOB_ID),
            intent.getStringExtra(EXTRA_TITLE),
            intent.getStringExtra(EXTRA_BODY),
            intent.getStringExtra(EXTRA_LARGE_BODY),
            intent.getStringExtra(EXTRA_REMINDER_LABEL),
            intent.getLongExtra(EXTRA_FIRE_AT, 0)
        );
    }

    JSONObject toJson() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("jobId", jobId);
        json.put("title", title);
        json.put("body", body);
        json.put("largeBody", largeBody);
        json.put("reminderLabel", reminderLabel);
        json.put("fireAt", fireAt);
        return json;
    }

    Intent putExtras(Intent intent) {
        intent.putExtra(EXTRA_ID, id);
        intent.putExtra(EXTRA_JOB_ID, jobId);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_BODY, body);
        intent.putExtra(EXTRA_LARGE_BODY, largeBody);
        intent.putExtra(EXTRA_REMINDER_LABEL, reminderLabel);
        intent.putExtra(EXTRA_FIRE_AT, fireAt);
        return intent;
    }

    TailorDeckAlarmPayload snoozed(long fireAtMillis) {
        return new TailorDeckAlarmPayload(id, jobId, title, body, "Snoozed for 15 minutes.", reminderLabel, fireAtMillis);
    }
}
