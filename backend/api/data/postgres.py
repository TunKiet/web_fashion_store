import os
from django.db import connection

# 1. Cấu hình PostgreSQL cho Django settings.py
# Bạn có thể import cấu hình này trực tiếp vào settings.py để kết nối với cơ sở dữ liệu PostgreSQL.
POSTGRES_DB_CONFIG = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': os.getenv('DB_NAME', 'the_k_luxury_db'),
    'USER': os.getenv('DB_USER', 'postgres'),
    'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
    'HOST': os.getenv('DB_HOST', 'localhost'),
    'PORT': os.getenv('DB_PORT', '5432'),
}

# 2. Hàm xử lý truy vấn PostgreSQL thô (Raw SQL connection)
def execute_raw_query(query, params=None):
    """
    Thực thi một truy vấn SQL thô trên PostgreSQL và trả về kết quả dạng danh sách các dict.
    """
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        if cursor.description:
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        return None
