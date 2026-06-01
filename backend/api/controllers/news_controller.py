from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.models.news_item import NewsItem
from api.services.news_service import fetch_and_cache_news

@api_view(['GET'])
@permission_classes([AllowAny])
def get_fashion_news(request):
    try:
        # If database is empty, fetch synchronously once to avoid returning an empty list
        if not NewsItem.objects.exists():
            print("[News Controller] News database cache is empty. Fetching initial feed...")
            fetch_and_cache_news(limit=30)

        # Fetch latest cached items from database
        news_items = NewsItem.objects.all()[:30]

        # Format for frontend client consumption
        data = [{
            'title': item.title,
            'link': item.link,
            'description': item.description,
            'pubDate': item.pub_date,
            'creator': item.creator,
            'image': item.image
        } for item in news_items]

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error serving cached fashion news: {e}")
        return Response(
            {"error": "Failed to fetch fashion news"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
