package app.testament.bible;

import android.content.Context;
import android.util.Log;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.Calendar;
import java.util.concurrent.TimeUnit;

/**
 * Manages battery-friendly scheduling of the native daily reminder via WorkManager.
 */
public class ReminderScheduler {

    private static final String TAG = "ReminderScheduler";
    public static final String WORK_NAME_DAILY_REMINDER = "testament_daily_reminder_periodic";
    public static final String WORK_TAG_DAILY_REMINDER = "testament_daily_reminder";

    public static void scheduleDailyReminder(Context context) {
        if (!ReminderPreferences.isReminderEnabled(context)) {
            cancelDailyReminder(context);
            return;
        }

        int targetHour = ReminderPreferences.getReminderHour(context);
        int targetMinute = ReminderPreferences.getReminderMinute(context);

        Calendar now = Calendar.getInstance();
        Calendar target = Calendar.getInstance();
        target.set(Calendar.HOUR_OF_DAY, targetHour);
        target.set(Calendar.MINUTE, targetMinute);
        target.set(Calendar.SECOND, 0);
        target.set(Calendar.MILLISECOND, 0);

        if (target.before(now)) {
            target.add(Calendar.DAY_OF_YEAR, 1);
        }

        long initialDelayMillis = target.getTimeInMillis() - now.getTimeInMillis();
        Log.d(TAG, "Scheduling daily reminder in " + (initialDelayMillis / 1000) + " seconds (target: " + targetHour + ":" + targetMinute + ")");

        PeriodicWorkRequest periodicWorkRequest = new PeriodicWorkRequest.Builder(
                DailyReminderWorker.class,
                24, TimeUnit.HOURS
        )
                .setInitialDelay(initialDelayMillis, TimeUnit.MILLISECONDS)
                .addTag(WORK_TAG_DAILY_REMINDER)
                .build();

        WorkManager.getInstance(context.getApplicationContext()).enqueueUniquePeriodicWork(
                WORK_NAME_DAILY_REMINDER,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodicWorkRequest
        );
    }

    public static void cancelDailyReminder(Context context) {
        Log.d(TAG, "Cancelling daily reminder work");
        WorkManager.getInstance(context.getApplicationContext())
                .cancelUniqueWork(WORK_NAME_DAILY_REMINDER);
    }
}
