from django.core.management.base import BaseCommand
from api.services.news_service import fetch_and_cache_news

class Command(BaseCommand):
    help = 'Fetches fashion news from Vogue RSS feed, translates, and caches in PostgreSQL database.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Vogue RSS news synchronization..."))
        try:
            count = fetch_and_cache_news(limit=30)
            self.stdout.write(self.style.SUCCESS(f"Successfully processed RSS feed. Saved {count} new items."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error during synchronization: {e}"))
