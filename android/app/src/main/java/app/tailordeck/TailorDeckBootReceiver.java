package app.tailordeck;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class TailorDeckBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;

        long now = System.currentTimeMillis();
        for (int id : TailorDeckAlarmScheduler.getStoredIds(context)) {
            TailorDeckAlarmPayload payload = TailorDeckAlarmScheduler.getPayload(context, id);
            if (payload == null) continue;
            if (payload.fireAt <= now) {
                TailorDeckAlarmScheduler.cancel(context, id);
                continue;
            }
            TailorDeckAlarmScheduler.schedule(context, payload);
        }
    }
}
