from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from api.data import check_postgres_connection
        check_postgres_connection()

        # Start a background thread to update news every 20 minutes
        import os
        import threading
        import time

        # Run only in the main worker process (ignore the reloader monitor process)
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('DJANGO_SETTINGS_MODULE'):
            def news_updater():
                # Wait 10 seconds for database migrations/startup to settle
                time.sleep(10)
                while True:
                    try:
                        print("[Background Sync] Syncing Vogue RSS for new fashion news...")
                        from api.services.news_service import fetch_and_cache_news
                        fetch_and_cache_news(limit=30)
                    except Exception as e:
                        print(f"[Background Sync] Error in background news update thread: {e}")
                    # Sleep for 20 minutes
                    time.sleep(20 * 60)

            thread = threading.Thread(target=news_updater, daemon=True, name="NewsUpdaterThread")
            thread.start()

