from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("healthcare", "0002_otpchallenge_notification_report"),
    ]

    operations = [
        migrations.AlterField(
            model_name="patientprofile",
            name="avatar",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="patientprofile",
            name="document",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="doctorprofile",
            name="avatar",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="doctorprofile",
            name="document",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="staffprofile",
            name="avatar",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="staffprofile",
            name="document",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
