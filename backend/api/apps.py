from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Kiểm tra kết nối PostgreSQL khi ứng dụng khởi động
        from api.data import check_postgres_connection
        check_postgres_connection()
