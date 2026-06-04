import json
import logging
from openai import OpenAI
import os

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
)

class AIService:
    @staticmethod
    def get_product_recommendations(query, items):
        """
        Dùng OpenAI để gợi ý các sản phẩm phù hợp dựa trên query của khách hàng.
        """
        if not client.api_key:
            logger.warning("OPENAI_API_KEY is not set.")
            return []

        # Chuẩn bị dữ liệu sản phẩm tối giản để giảm token
        serialized_items = []
        for item in items:
            serialized_items.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "price": str(item.price),
                "category": item.category
            })

        products_json = json.dumps(serialized_items, ensure_ascii=False)

        system_prompt = (
            "Bạn là một trợ lý thời trang cao cấp của cửa hàng 'The K Luxury'. Nhiệm vụ của bạn là dựa trên yêu cầu tìm kiếm của khách hàng để gợi ý tối đa 5 sản phẩm phù hợp nhất trong danh sách sản phẩm của cửa hàng.\n"
            "Hãy trả về kết quả dưới dạng một JSON array gồm các đối tượng có thuộc tính:\n"
            "- 'id': ID của sản phẩm (kiểu số)\n"
            "- 'reason': Lý do gợi ý ngắn gọn, tinh tế, sang trọng bằng tiếng Việt (khoảng 1-2 câu).\n\n"
            "Lưu ý: Chỉ trả về chuỗi JSON thô hợp lệ, không có thẻ ```json hoặc bất kỳ ký tự nào khác ngoài JSON."
        )

        user_prompt = f"Danh sách sản phẩm:\n{products_json}\n\nYêu cầu tìm kiếm của khách hàng: '{query}'"

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            response_content = response.choices[0].message.content.strip()
            
            # Làm sạch nếu GPT vẫn trả về ```json
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]
            response_content = response_content.strip()

            recommendations = json.loads(response_content)
            return recommendations
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            return []