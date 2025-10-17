"""Test script for Celery tasks."""

import sys
from datetime import datetime, timedelta
from app.core.celery_app import celery_app
from app.tasks.notifications import (
    send_email_async,
    send_appointment_confirmation,
    send_appointment_cancellation,
    send_appointment_reminder
)
from app.tasks.scheduled_jobs import (
    send_appointment_reminders,
    reset_weekly_slots,
    cleanup_old_notifications,
    mark_completed_appointments,
    send_daily_summary
)


def test_celery_connection():
    """Test if Celery can connect to Redis."""
    print("🔍 Testing Celery connection to Redis...")
    try:
        # Ping the broker
        celery_app.control.inspect().stats()
        print("✅ Successfully connected to Redis!")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        print("   Make sure Redis is running: redis-cli ping")
        return False


def test_email_task():
    """Test sending an email asynchronously."""
    print("\n📧 Testing async email task...")
    try:
        result = send_email_async.delay(
            recipient_email="test@example.com",
            subject="Celery Test Email",
            body="This is a test email from Celery.",
            html_body="<h1>This is a test email from Celery</h1>"
        )
        print(f"✅ Email task queued! Task ID: {result.id}")
        print(f"   Task status: {result.status}")
        return True
    except Exception as e:
        print(f"❌ Failed to queue email task: {e}")
        return False


def test_scheduled_tasks():
    """Test that scheduled tasks are registered."""
    print("\n📅 Testing scheduled tasks...")
    try:
        inspect = celery_app.control.inspect()
        scheduled = inspect.scheduled()

        if scheduled:
            print("✅ Scheduled tasks found:")
            for worker, tasks in scheduled.items():
                print(f"   Worker: {worker}")
                for task in tasks:
                    print(f"   - {task['request']['name']}")
        else:
            print("ℹ️  No scheduled tasks currently (normal if Beat isn't running)")

        return True
    except Exception as e:
        print(f"❌ Failed to check scheduled tasks: {e}")
        return False


def test_registered_tasks():
    """Test that all tasks are registered."""
    print("\n📋 Checking registered tasks...")
    try:
        inspect = celery_app.control.inspect()
        registered = inspect.registered()

        if registered:
            print("✅ Registered tasks:")
            for worker, tasks in registered.items():
                print(f"\n   Worker: {worker}")
                task_list = sorted(tasks)
                for task in task_list:
                    if task.startswith('app.tasks'):
                        print(f"   ✓ {task}")
            return True
        else:
            print("⚠️  No workers running. Start worker with:")
            print("   celery -A app.core.celery_app worker --loglevel=info")
            return False
    except Exception as e:
        print(f"❌ Failed to check registered tasks: {e}")
        return False


def test_beat_schedule():
    """Show the Beat schedule configuration."""
    print("\n⏰ Celery Beat Schedule:")

    schedule = celery_app.conf.beat_schedule

    if schedule:
        print("✅ Configured periodic tasks:")
        for name, config in schedule.items():
            task_name = config['task']
            schedule_info = config['schedule']
            print(f"\n   📌 {name}")
            print(f"      Task: {task_name}")
            print(f"      Schedule: {schedule_info}")
    else:
        print("❌ No Beat schedule configured")

    return True


def test_manual_task_execution():
    """Test manual execution of tasks."""
    print("\n🚀 Testing manual task execution...")

    # Note: These won't actually send emails without valid data
    print("   You can manually trigger tasks like:")
    print("   1. send_appointment_confirmation.delay('appointment-id')")
    print("   2. send_appointment_cancellation.delay('appointment-id', 'parent')")
    print("   3. send_appointment_reminder.delay('appointment-id')")
    print("   4. send_appointment_reminders.delay()")
    print("   5. reset_weekly_slots.delay()")

    return True


def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 Celery + Redis Background Jobs Test Suite")
    print("=" * 60)

    tests = [
        ("Connection Test", test_celery_connection),
        ("Registered Tasks", test_registered_tasks),
        ("Beat Schedule", test_beat_schedule),
        ("Email Task", test_email_task),
        ("Scheduled Tasks", test_scheduled_tasks),
        ("Manual Execution Info", test_manual_task_execution),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Test '{name}' failed with error: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Celery is working correctly.")
        print("\n📚 Next steps:")
        print("   1. Start FastAPI: uvicorn app.main:app --reload --port 8001")
        print("   2. Start Celery Worker: celery -A app.core.celery_app worker --loglevel=info")
        print("   3. Start Celery Beat: celery -A app.core.celery_app beat --loglevel=info")
        print("   4. Monitor with Flower: celery -A app.core.celery_app flower --port=5555")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   - Make sure Redis is running: redis-cli ping")
        print("   - Make sure Celery worker is running")
        print("   - Check your .env file for correct REDIS_URL")

    print("=" * 60)


if __name__ == "__main__":
    main()
