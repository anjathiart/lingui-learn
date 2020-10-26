# Generated by Django 3.1.2 on 2020-10-26 18:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('linguilearn', '0005_auto_20201026_1833'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='entries_learning',
        ),
        migrations.AddField(
            model_name='user',
            name='entries',
            field=models.ManyToManyField(related_name='users', to='linguilearn.Entry'),
        ),
    ]
