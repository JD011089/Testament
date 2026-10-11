package app.testament.bible;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * WorkManager worker executing the daily local reminder.
 * Operates purely on-device without remote calls, push backends, or tracking.
 */
public class DailyReminderWorker extends Worker {

    private static final String TAG = "DailyReminderWorker";
    public static final String CHANNEL_ID = "testament_daily_reminders";
    public static final int NOTIFICATION_ID = 1001;

    public DailyReminderWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();

        // Guardrail: Verify user still has reminder enabled
        if (!ReminderPreferences.isReminderEnabled(context)) {
            Log.d(TAG, "Reminder is disabled by user, skipping.");
            return Result.success();
        }

        showNotificationDirectly(context);
        return Result.success();
    }

    /**
     * Posts the notification to the device status bar.
     * Accessible by Worker, AlarmReceiver, and Settings test button.
     */
    public static void showNotificationDirectly(Context context) {
        // Guardrail: Verify POST_NOTIFICATIONS permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "Notification permission not granted, skipping.");
                return;
            }
        }

        try {
            createNotificationChannel(context);

            // Deep-link into the app's start URL (opens the PWA home)
            Intent intent = new Intent(context, LauncherActivity.class);
            intent.setAction(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("https://testament-bible-learning.vercel.app/"));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    flags
            );

            String title = context.getString(R.string.notification_reminder_title);
            String body = context.getString(R.string.notification_reminder_body);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification_icon)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setColor(Color.parseColor("#D97706")) // Amber gold
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
            notificationManager.notify(NOTIFICATION_ID, builder.build());
            Log.d(TAG, "Daily reminder notification posted successfully.");
        } catch (Throwable t) {
            Log.e(TAG, "Error displaying daily reminder notification", t);
        }
    }

    private static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = context.getString(R.string.notification_channel_name);
            String description = context.getString(R.string.notification_channel_description);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.setLightColor(Color.parseColor("#D97706"));

            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
