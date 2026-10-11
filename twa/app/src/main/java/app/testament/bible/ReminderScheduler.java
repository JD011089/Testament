package app.testament.bible;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.Calendar;
import java.util.concurrent.TimeUnit;

/**
 * Manages dual scheduling of the native daily reminder via AlarmManager (for reliable time-of-day
 * delivery) and WorkManager (for resilient background execution).
 */
public class ReminderScheduler {

    private static final String TAG = "ReminderScheduler";
    public static final String WORK_NAME_DAILY_REMINDER = "testament_daily_reminder_periodic";
    public static final String WORK_TAG_DAILY_REMINDER = "testament_daily_reminder";
    private static final int ALARM_REQUEST_CODE = 1002;

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
        long triggerAtMillis = target.getTimeInMillis();

        Log.d(TAG, "Scheduling daily reminder for " + targetHour + ":" + String.format("%02d", targetMinute)
                + " (in " + (initialDelayMillis / 1000) + "s)");

        // 1. Primary: AlarmManager setAndAllowWhileIdle (wakes device at target time without exact-alarm permission)
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                Intent alarmIntent = new Intent(context, ReminderAlarmReceiver.class);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        context,
                        ALARM_REQUEST_CODE,
                        alarmIntent,
                        flags
                );

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                }
            }
        } catch (Throwable t) {
            Log.e(TAG, "Error scheduling AlarmManager reminder", t);
        }

        // 2. Secondary / Backup: WorkManager periodic work
        try {
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
        } catch (Throwable t) {
            Log.e(TAG, "Error scheduling WorkManager reminder", t);
        }
    }

    public static void cancelDailyReminder(Context context) {
        Log.d(TAG, "Cancelling daily reminder");

        // Cancel AlarmManager
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                Intent alarmIntent = new Intent(context, ReminderAlarmReceiver.class);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        context,
                        ALARM_REQUEST_CODE,
                        alarmIntent,
                        flags
                );
                alarmManager.cancel(pendingIntent);
            }
        } catch (Throwable t) {
            Log.e(TAG, "Error cancelling AlarmManager reminder", t);
        }

        // Cancel WorkManager
        try {
            WorkManager.getInstance(context.getApplicationContext())
                    .cancelUniqueWork(WORK_NAME_DAILY_REMINDER);
        } catch (Throwable t) {
            Log.e(TAG, "Error cancelling WorkManager reminder", t);
        }
    }
}
