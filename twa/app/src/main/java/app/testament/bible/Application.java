package app.testament.bible;

public class Application extends android.app.Application {

    @Override
    public void onCreate() {
        super.onCreate();
        // If user has opted in to daily reminders, ensure WorkManager schedule is active
        if (ReminderPreferences.isReminderEnabled(this)) {
            ReminderScheduler.scheduleDailyReminder(this);
        }
    }
}
