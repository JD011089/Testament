package app.testament.bible;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Re-registers the daily reminder work request after device reboot or app update.
 */
public class BootReceiver extends BroadcastReceiver {

    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
                Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            Log.d(TAG, "Device rebooted or package replaced: checking daily reminder schedule.");
            if (ReminderPreferences.isReminderEnabled(context)) {
                ReminderScheduler.scheduleDailyReminder(context);
            }
        }
    }
}
