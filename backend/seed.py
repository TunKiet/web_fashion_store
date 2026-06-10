import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Item

print("Đang xóa các sản phẩm cũ...")
Item.objects.all().delete()

items = [
    {
        "title": "THE NOCTURNAL GOWN",
        "description": "Chiếc đầm dạ hội Haute Couture được cắt may từ lụa tơ tằm dâu cao cấp, nổi bật với thiết kế draping xếp nếp tinh xảo, mang phong vị huyền biến của đêm Paris.",
        "price": 95000000.00,
        "image_url": "/images/aura_hero_model.png",
        "category": "Đầm dạ hội",
        "is_featured": True
    },
    {
        "title": "LE SAC NOIR",
        "description": "Túi xách da bê nguyên tấm sang quý nhất của AURA, khóa mạ vàng gold 18K tinh xảo và đường may chìm sang trọng được thực hiện hoàn toàn thủ công.",
        "price": 85000000.00,
        "image_url": "/images/aura_sac_noir.png",
        "category": "Túi xách",
        "is_featured": True
    },
    {
        "title": "LUNA EARRINGS",
        "description": "Khuyên tai vàng thiết kế vòng cung kép uốn lượn, chế tác từ vàng nguyên khối 18K đem lại vẻ sang trọng kiêu kỳ và thu hút mọi ánh nhìn.",
        "price": 25000000.00,
        "image_url": "/images/aura_luna_earrings.png",
        "category": "Trang sức",
        "is_featured": True
    },
    {
        "title": "THE NOCTURNAL CLUTCH",
        "description": "Ví cầm tay envelope chế tác từ da trăn đỏ nhập khẩu cao cấp, thiết kế mỏng nhẹ tinh xảo cùng khóa cài khắc logo AURA sắc nét.",
        "price": 42000000.00,
        "image_url": "/images/aura_nocturnal_clutch.png",
        "category": "Túi xách",
        "is_featured": True
    },
    {
        "title": "THE AURORA PUMPS",
        "description": "Đôi stiletto cao gót da bê dập vân sắc sảo, phom dáng kiêu kỳ và gót nhọn thanh thoát giúp tôn vinh sải bước quyền lực quý phái.",
        "price": 38000000.00,
        "image_url": "/images/aura_aurora_pumps.png",
        "category": "Giày",
        "is_featured": True
    },
    {
        "title": "THE ATELIER SILK ROBE",
        "description": "Áo choàng ngủ satin tơ tằm dâu cao cấp, tay áo phối ren Guipure tinh xảo thêu tay đem lại cảm giác êm mềm tối thượng.",
        "price": 55000000.00,
        "image_url": "/images/aura_fabric_2.png",
        "category": "Trang phục ngủ",
        "is_featured": False
    },
    {
        "title": "THE NOCTURNAL VELVET COAT",
        "description": "Áo khoác măng tô dáng dài chất liệu nhung tơ tằm mịn màng, lót lụa tơ tằm dệt hoa chìm sang trọng thích hợp cho tiết trời se lạnh.",
        "price": 68000000.00,
        "image_url": "/images/aura_fabric_3.png",
        "category": "Áo khoác",
        "is_featured": False
    }
]

for item_data in items:
    Item.objects.create(**item_data)

print(f"Đã nạp thành công {len(items)} sản phẩm thời trang cao cấp bằng tiếng Việt vào cơ sở dữ liệu.")
