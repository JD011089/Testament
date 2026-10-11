package app.testament.bible;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.Calendar;

/**
 * Handles persistence of user opt-in status and preferred delivery time
 * for the local daily mission reminder in device SharedPreferences.
 */
public class ReminderPreferences {

    private static final String PREFS_NAME = "testament_reminders";
    private static final String KEY_ENABLED = "daily_reminder_enabled";
    private static final String KEY_HOUR = "daily_reminder_hour";
    private static final String KEY_MINUTE = "daily_reminder_minute";

    public static final int DEFAULT_HOUR = 8;
    public static final int DEFAULT_MINUTE = 0;

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static boolean isReminderEnabled(Context context) {
        return getPrefs(context).getBoolean(KEY_ENABLED, false);
    }

    public static void setReminderEnabled(Context context, boolean enabled) {
        getPrefs(context).edit().putBoolean(KEY_ENABLED, enabled).apply();
    }

    public static int getReminderHour(Context context) {
        return getPrefs(context).getInt(KEY_HOUR, DEFAULT_HOUR);
    }

    public static int getReminderMinute(Context context) {
        return getPrefs(context).getInt(KEY_MINUTE, DEFAULT_MINUTE);
    }

    public static void setReminderTime(Context context, int hour, int minute) {
        getPrefs(context).edit()
                .putInt(KEY_HOUR, hour)
                .putInt(KEY_MINUTE, minute)
                .apply();
    }

    public static String getFormattedTime(Context context) {
        int hour = getReminderHour(context);
        int minute = getReminderMinute(context);
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minute);

        java.text.DateFormat format = android.text.format.DateFormat.getTimeFormat(context);
        return format.format(calendar.getTime());
    }
}
