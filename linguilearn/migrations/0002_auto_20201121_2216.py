# Generated by Django 3.1.2 on 2020-11-21 22:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('linguilearn', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='entry',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='entry',
            name='last_modified',
        ),
    ]
