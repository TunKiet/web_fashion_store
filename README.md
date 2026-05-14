# Hướng dẫn tạo React Frontend và Django Backend

## Mục lục
- [Chuẩn bị](#chuẩn-bị)
- [Tạo Frontend React](#tạo-frontend-react)
- [Tạo Backend Django](#tạo-backend-django)
- [Kết nối Frontend và Backend](#kết-nối-frontend-và-backend)

---

## Chuẩn bị

### Yêu cầu hệ thống
- **Node.js** phiên bản 14.0 trở lên (cho React)
- **Python** phiên bản 3.8 trở lên (cho Django)
- **npm** hoặc **yarn** (quản lý gói cho Node.js)
- **pip** (quản lý gói cho Python)

### Kiểm tra các tool đã cài
```bash
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Kiểm tra Python
python --version

# Kiểm tra pip
pip --version
```

---

## Tạo Frontend React

### Bước 1: Tạo dự án React mới
```bash
# Sử dụng Create React App
npx create-react-app frontend

# Hoặc sử dụng Vite (nhanh hơn)
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Bước 2: Cấu trúc thư mục
```
frontend/
├── public/
├── src/
│   ├── components/       # Các component React
│   ├── pages/           # Các trang
│   ├── services/        # API calls
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js       # (nếu dùng Vite)
```

### Bước 3: Cài đặt dependencies
```bash
# Axios để gọi API
npm install axios

# React Router (nếu cần routing)
npm install react-router-dom
```

### Bước 4: Tạo service gọi API
Tạo file `src/services/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getItems = () => api.get('/items/');
export const createItem = (data) => api.post('/items/', data);
export const updateItem = (id, data) => api.put(`/items/${id}/`, data);
export const deleteItem = (id) => api.delete(`/items/${id}/`);

export default api;
```

### Bước 5: Chạy frontend
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (Vite) hoặc `http://localhost:3000` (Create React App)

---

## Tạo Backend Django

### Bước 1: Tạo môi trường ảo
```bash
# Trên Windows
python -m venv venv

# Kích hoạt môi trường ảo
venv\Scripts\activate
```

### Bước 2: Cài đặt Django
```bash
pip install django djangorestframework django-cors-headers
```

### Bước 3: Tạo dự án Django
```bash
# Tạo dự án
django-admin startproject backend .

# Tạo ứng dụng
python manage.py startapp api
```

### Bước 4: Cấu hình Django (`backend/settings.py`)

Thêm vào `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
```

Thêm middleware cho CORS:
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... middleware khác
]

# Cấu hình CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
]
```

### Bước 5: Tạo Models
Tạo file `api/models.py`:
```python
from django.db import models

class Item(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

### Bước 6: Tạo Serializers
Tạo file `api/serializers.py`:
```python
from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
```

### Bước 7: Tạo Views
Tạo file `api/views.py`:
```python
from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
```

### Bước 8: Cấu hình URLs
Tạo file `api/urls.py`:
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

Cập nhật `backend/urls.py`:
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

### Bước 9: Tạo database
```bash
# Tạo migration
python manage.py makemigrations

# Áp dụng migration
python manage.py migrate

# Tạo superuser (tùy chọn)
python manage.py createsuperuser
```

### Bước 10: Chạy backend
```bash
python manage.py runserver
```

Backend sẽ chạy tại `http://localhost:8000`

---

## Kết nối Frontend và Backend

### 1. Đảm bảo cả hai máy chủ đang chạy
```bash
# Terminal 1: Chạy Backend
python manage.py runserver

# Terminal 2: Chạy Frontend
npm run dev
```

### 2. Sử dụng API trong React
```javascript
import { useEffect, useState } from 'react';
import { getItems } from './services/api';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItems()
      .then(response => {
        setItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h1>Danh sách Items</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

### 3. Kiểm tra kết nối
- Mở `http://localhost:5173` (Frontend)
- Kiểm tra Network tab trong DevTools
- Các request tới API nên trả về dữ liệu từ Backend

---

## Troubleshooting

### Lỗi CORS
- Kiểm tra danh sách `CORS_ALLOWED_ORIGINS` trong `settings.py`
- Đảm bảo `corsheaders` đã cài đặt: `pip install django-cors-headers`

### Lỗi kết nối
- Kiểm tra cả Frontend và Backend đang chạy
- Kiểm tra port (Django: 8000, React: 5173/3000)

### Database errors
- Chạy `python manage.py migrate` lại
- Kiểm tra file `db.sqlite3` tồn tại

---

## Tài liệu tham khảo
- [React Documentation](https://react.dev)
- [Django Documentation](https://docs.djangoproject.com)
- [Django REST Framework](https://www.django-rest-framework.org)
