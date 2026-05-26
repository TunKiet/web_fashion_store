import os
from django.db import connection

POSTGRES_DB_CONFIG = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': os.getenv('DB_NAME', 'the_k_luxury_db'),
    'USER': os.getenv('DB_USER', 'postgres'),
    'PASSWORD': os.getenv('DB_PASSWORD', '123456'),
    'HOST': os.getenv('DB_HOST', 'localhost'),
    'PORT': os.getenv('DB_PORT', '5432'),
}

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

def check_postgres_connection():
    """
    Kiểm tra đã kết nối được PostgreSQL chưa.
    Nếu chưa, thông báo log 'Chưa kết nối SQL được'.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    if connection.settings_dict.get('ENGINE') == 'django.db.backends.postgresql':
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
            logger.info("Kết nối PostgreSQL (default) thành công!")
            print("[PostgreSQL] Ket noi PostgreSQL (default) thanh cong!")
            return True
        except Exception as e:
            logger.error("Chưa kết nối SQL được: %s", e)
            print("[PostgreSQL] Chua ket noi SQL duoc")
            return False
    else:
        from django.db.utils import ConnectionHandler
        db_config = {
            'default': POSTGRES_DB_CONFIG
        }
        handler = ConnectionHandler(db_config)
        try:
            conn = handler['default']
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1;")
            logger.info("Kết nối PostgreSQL (dynamic check) thành công!")
            print("[PostgreSQL] Ket noi PostgreSQL (dynamic check) thanh cong!")
            return True
        except Exception as e:
            logger.error("Chưa kết nối SQL được: %s", e)
            print("[PostgreSQL] Chua ket noi SQL duoc")
            return False


