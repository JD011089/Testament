package app.testament.bible;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

/**
 * Minimal native settings screen providing opt-in daily reminder toggle and time picker.
 */
public class SettingsActivity extends Activity {

    private static final String TAG = "SettingsActivity";
    private static final int REQUEST_CODE_POST_NOTIFICATIONS = 1001;

    private Switch switchDailyReminder;
    private View cardDailyReminder;
    private View rowReminderTime;
    private TextView tvReminderTime;
    private View btnBack;
    private boolean isUpdatingUi = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        switchDailyReminder = findViewById(R.id.switch_daily_reminder);
        cardDailyReminder = findViewById(R.id.card_daily_reminder);
        rowReminderTime = findViewById(R.id.row_reminder_time);
        tvReminderTime = findViewById(R.id.tv_reminder_time);
        btnBack = findViewById(R.id.btn_back);

        btnBack.setOnClickListener(v -> navigateBackToApp());

        cardDailyReminder.setOnClickListener(v -> switchDailyReminder.toggle());

        switchDailyReminder.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isUpdatingUi) return;

            if (isChecked) {
                requestPermissionAndEnable();
            } else {
                disableReminder();
            }
        });

        rowReminderTime.setOnClickListener(v -> showTimePickerDialog());

        updateUiFromPreferences();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateUiFromPreferences();
    }

    private void updateUiFromPreferences() {
        isUpdatingUi = true;
        boolean isEnabled = ReminderPreferences.isReminderEnabled(this);

        // If permission was revoked at system level on Android 13+, degrade gracefully
        if (isEnabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                isEnabled = false;
                ReminderPreferences.setReminderEnabled(this, false);
                ReminderScheduler.cancelDailyReminder(this);
            }
        }

        switchDailyReminder.setChecked(isEnabled);
        tvReminderTime.setText(ReminderPreferences.getFormattedTime(this));
        rowReminderTime.setAlpha(isEnabled ? 1.0f : 0.5f);
        isUpdatingUi = false;
    }

    private void requestPermissionAndEnable() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                // One plain-language explanation line in context before requesting
                new AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_DARK)
                        .setTitle(R.string.permission_dialog_title)
                        .setMessage(R.string.permission_dialog_message)
                        .setPositiveButton(R.string.permission_dialog_positive, (dialog, which) -> {
                            ActivityCompat.requestPermissions(
                                    SettingsActivity.this,
                                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                                    REQUEST_CODE_POST_NOTIFICATIONS
                            );
                        })
                        .setNegativeButton(R.string.permission_dialog_negative, (dialog, which) -> {
                            // User chose not to grant; keep toggle off without nagging
                            revertToggleOff();
                        })
                        .setOnCancelListener(dialog -> revertToggleOff())
                        .show();
                return;
            }
        }

        // Permission already granted or Android < 13
        enableReminder();
    }

    private void enableReminder() {
        ReminderPreferences.setReminderEnabled(this, true);
        ReminderScheduler.scheduleDailyReminder(this);
        updateUiFromPreferences();
        Toast.makeText(this, R.string.reminder_scheduled_toast, Toast.LENGTH_SHORT).show();
    }

    private void disableReminder() {
        ReminderPreferences.setReminderEnabled(this, false);
        ReminderScheduler.cancelDailyReminder(this);
        updateUiFromPreferences();
        Toast.makeText(this, R.string.reminder_cancelled_toast, Toast.LENGTH_SHORT).show();
    }

    private void revertToggleOff() {
        ReminderPreferences.setReminderEnabled(this, false);
        updateUiFromPreferences();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CODE_POST_NOTIFICATIONS) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                enableReminder();
            } else {
                // Denied: toggle stays off, no nagging, no re-prompt loops
                revertToggleOff();
            }
        }
    }

    private void showTimePickerDialog() {
        int currentHour = ReminderPreferences.getReminderHour(this);
        int currentMinute = ReminderPreferences.getReminderMinute(this);
        boolean is24Hour = DateFormat.is24HourFormat(this);

        TimePickerDialog dialog = new TimePickerDialog(
                this,
                AlertDialog.THEME_DEVICE_DEFAULT_DARK,
                (view, hourOfDay, minute) -> {
                    ReminderPreferences.setReminderTime(SettingsActivity.this, hourOfDay, minute);
                    updateUiFromPreferences();
                    if (ReminderPreferences.isReminderEnabled(SettingsActivity.this)) {
                        ReminderScheduler.scheduleDailyReminder(SettingsActivity.this);
                        Toast.makeText(SettingsActivity.this, R.string.reminder_time_updated_toast, Toast.LENGTH_SHORT).show();
                    }
                },
                currentHour,
                currentMinute,
                is24Hour
        );
        dialog.show();
    }

    private void navigateBackToApp() {
        if (isTaskRoot()) {
            Intent intent = new Intent(this, LauncherActivity.class);
            intent.setAction(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        }
        finish();
    }

    @Override
    public void onBackPressed() {
        navigateBackToApp();
    }
}
