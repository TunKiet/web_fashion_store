import hmac
import hashlib
import json
import urllib.request
import time
import logging

logger = logging.getLogger(__name__)

class MomoService:
    PARTNER_CODE = 'MOMO'
    ACCESS_KEY = 'F8BBA842ECF85'
    SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
    MOMO_API_URL = 'https://test-payment.momo.vn/v2/gateway/api/create'

    @classmethod
    def generate_signature(cls, raw_data):
        return hmac.new(
            cls.SECRET_KEY.encode('utf-8'),
            raw_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @classmethod
    def create_payment_session(cls, order, redirect_url, ipn_url):
        """
        Gửi yêu cầu thanh toán tới cổng MoMo Sandbox.
        """
        amount = str(int(order.total_price))
        # Tạo orderId duy nhất bằng cách đính kèm timestamp để tránh trùng lặp khi thanh toán lại
        order_id = f"TK_ORDER_{order.id}_{int(time.time())}"
        request_id = order_id
        order_info = f"Thanh toan don hang #{order.id} tai The K Luxury"
        request_type = "payWithMethod"
        extra_data = ""

        # Chuỗi chữ ký thô theo thứ tự bảng chữ cái của các tham số
        raw_signature = (
            f"accessKey={cls.ACCESS_KEY}&"
            f"amount={amount}&"
            f"extraData={extra_data}&"
            f"ipnUrl={ipn_url}&"
            f"orderId={order_id}&"
            f"orderInfo={order_info}&"
            f"partnerCode={cls.PARTNER_CODE}&"
            f"redirectUrl={redirect_url}&"
            f"requestId={request_id}&"
            f"requestType={request_type}"
        )

        signature = cls.generate_signature(raw_signature)

        payload = {
            "partnerCode": cls.PARTNER_CODE,
            "partnerName": "The K Luxury",
            "storeId": "TheKLuxuryStore",
            "requestId": request_id,
            "amount": amount,
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": redirect_url,
            "ipnUrl": ipn_url,
            "lang": "vi",
            "requestType": request_type,
            "autoCapture": True,
            "extraData": extra_data,
            "orderGroupId": "",
            "signature": signature
        }

        # Gửi request lên cổng MoMo bằng thư viện urllib.request của python core
        req_body = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            cls.MOMO_API_URL,
            data=req_body,
            headers={
                "Content-Type": "application/json",
                "Content-Length": len(req_body)
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode('utf-8')
                res_data = json.loads(res_body)
                
                result_code = res_data.get('resultCode')
                if result_code == 0:
                    # Ghi nhận MoMo Order ID để đối chiếu sau này
                    order.notes = f"{order.notes}\n[MoMo Order ID: {order_id}]".strip()
                    order.save()
                    return res_data.get('payUrl')
                else:
                    logger.error(f"MoMo error (code {result_code}): {res_data.get('message')}")
                    raise Exception(f"MoMo error: {res_data.get('message')}")
        except Exception as e:
            logger.error(f"Failed to connect to MoMo: {str(e)}")
            raise Exception(f"Không thể kết nối đến cổng thanh toán MoMo: {str(e)}")

    @classmethod
    def verify_callback_signature(cls, data):
        """
        Xác minh chữ ký phản hồi (IPN hoặc Redirect) từ MoMo.
        Trả về: (is_valid, debug_info)
        """
        received_signature = data.get('signature')
        if not received_signature:
            return False, {"error": "Missing signature", "received_signature": "", "calculated_signature": "", "raw_signature": ""}

        # Các trường hợp lệ có thể tham gia vào chữ ký của MoMo
        MOMO_KEYS = {
            'partnerCode', 'orderId', 'requestId', 'amount', 'orderInfo',
            'orderType', 'transId', 'resultCode', 'message', 'payType',
            'responseTime', 'extraData', 'accessKey', 'errorCode', 'localMessage'
        }

        # Lọc các trường của MoMo nhận được (loại trừ signature)
        sig_data = {k: v for k, v in data.items() if k in MOMO_KEYS and k != 'signature'}
        
        # Đảm bảo accessKey có mặt (MoMo không trả về accessKey trên redirect URL)
        sig_data['accessKey'] = cls.ACCESS_KEY

        # Chuẩn hóa giá trị: chuyển đổi None thành chuỗi rỗng và tất cả thành string
        for k in sig_data:
            if sig_data[k] is None:
                sig_data[k] = ""
            else:
                sig_data[k] = str(sig_data[k])

        # Sắp xếp các khóa alphabetically A-Z
        sorted_keys = sorted(sig_data.keys())

        # Tạo chuỗi ký tự thô để ký
        raw_parts = []
        for key in sorted_keys:
            raw_parts.append(f"{key}={sig_data[key]}")

        raw_signature = "&".join(raw_parts)
        calculated_signature = cls.generate_signature(raw_signature)

        is_valid = (calculated_signature == received_signature)

        debug_info = {
            "received_signature": received_signature,
            "calculated_signature": calculated_signature,
            "raw_signature": raw_signature,
            "data": data
        }
        return is_valid, debug_info
