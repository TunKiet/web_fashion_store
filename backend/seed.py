import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Item

print("Đang xóa các sản phẩm cũ...")
Item.objects.all().delete()

items = [
    {
        "title": "Đầm Dạ Hội Lụa Draping Cao Cấp",
        "description": "Chiếc đầm dạ hội sang trọng được cắt may từ lụa tơ tằm dâu cao cấp, nổi bật với phần cổ xếp nếp rủ (draping) quyến rũ và dáng váy thướt tha, uyển chuyển theo từng bước chuyển động.",
        "price": 31500000.00,
        "image_url": "/images/fashion_dress.png",
        "category": "Đầm dạ hội",
        "is_featured": True
    },
    {
        "title": "Áo Măng Tô Cashmere Khuy Đúp",
        "description": "Được chế tác từ sợi len hỗn hợp cashmere hai mặt thượng hạng, chiếc áo măng tô phom dáng khuy đúp (double-breasted) cổ điển này mang lại sự ấm áp tối đa cùng cấu trúc đứng phom thời thượng.",
        "price": 47250000.00,
        "image_url": "/images/fashion_coat.png",
        "category": "Áo khoác",
        "is_featured": True
    },
    {
        "title": "Túi Da Đeo Vai Tối Giản",
        "description": "Túi đeo vai tối giản làm từ chất liệu da bò nguyên tấm (full-grain calf leather) tuyển chọn. Thiết kế tinh tế với đường nét gọn gàng, khóa mạ vàng gold sang trọng và dây đeo tùy chỉnh.",
        "price": 23750000.00,
        "image_url": "/images/fashion_bag.png",
        "category": "Phụ kiện",
        "is_featured": True
    },
    {
        "title": "Áo Blazer Linen May Đo Cổ Điển",
        "description": "Chiếc áo blazer một khuy đa năng dệt từ sợi linen cao cấp của Ý. Thiết kế phom dáng thoải mái nhưng vẫn lịch lãm và chỉn chu, hoàn hảo cho những ngày hè sang trọng.",
        "price": 18000000.00,
        "image_url": "/images/fashion_dress.png",
        "category": "Áo khoác",
        "is_featured": False
    },
    {
        "title": "Giày Chelsea Da Bò Cổ Điển",
        "description": "Đôi giày Chelsea được hoàn thiện thủ công tỉ mỉ bằng chất liệu da bò mềm mại và dẻo dai. Đi kèm phần bo chun hai bên hông linh hoạt và đế da nhiều lớp bền bỉ.",
        "price": 21250000.00,
        "image_url": "/images/fashion_coat.png",
        "category": "Phụ kiện",
        "is_featured": False
    },
    {
        "title": "Áo Khoác Trench Wool Cách Điệu",
        "description": "Một phiên bản hiện đại từ phom áo khoác dáng dài truyền thống, được may đo trên chất liệu len virgin wool mềm mịn trung tính. Điểm nhấn là thắt lưng bản to và ve áo cứng cáp.",
        "price": 36250000.00,
        "image_url": "/images/fashion_coat.png",
        "category": "Áo khoác",
        "is_featured": False
    },
    {
        "title": "Áo Khoác Trench Wool Cách Điệu",
        "description": "Một phiên bản hiện đại từ phom áo khoác dáng dài truyền thống, được may đo trên chất liệu len virgin wool mềm mịn trung tính. Điểm nhấn là thắt lưng bản to và ve áo cứng cáp.",
        "price": 36250000.00,
        "image_url": "/images/fashion_coat.png",
        "category": "Áo khoác",
        "is_featured": False
    }
]

for item_data in items:
    Item.objects.create(**item_data)

print(f"Đã nạp thành công {len(items)} sản phẩm thời trang cao cấp bằng tiếng Việt vào cơ sở dữ liệu.")
