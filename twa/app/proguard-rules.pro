# Proguard rules for Testament TWA app

# Keep all classes in app.testament.bible
-keep public class app.testament.bible.** { *; }

# WorkManager reflection worker instantiation
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
