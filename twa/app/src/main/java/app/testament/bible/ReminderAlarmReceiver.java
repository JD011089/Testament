package app.testament.bible;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * BroadcastReceiver triggered by AlarmManager to post the daily reminder
 * near the user's chosen local time, even when the device is idle.
 */
public class ReminderAlarmReceiver extends BroadcastReceiver {

    private static final String TAG = "ReminderAlarmReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Alarm received for daily reminder");

        if (!ReminderPreferences.isReminderEnabled(context)) {
            Log.d(TAG, "Reminder is disabled by user, ignoring alarm.");
            return;
        }

        // Post the notification
        DailyReminderWorker.showNotificationDirectly(context);

        // Schedule the next occurrence for tomorrow
        ReminderScheduler.scheduleDailyReminder(context);
    }
}
