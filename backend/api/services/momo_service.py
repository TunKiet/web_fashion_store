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
        order_id = f"TK_ORDER_{order.id}_{int(time.time())}"
        request_id = order_id
        order_info = f"Thanh toan don hang #{order.id} tai The K Luxury"
        request_type = "payWithMethod"
        extra_data = ""

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
        received_signature = data.get('signature')
        if not received_signature:
            return False, {"error": "Missing signature", "received_signature": "", "calculated_signature": "", "raw_signature": ""}

        MOMO_KEYS = {
            'partnerCode', 'orderId', 'requestId', 'amount', 'orderInfo',
            'orderType', 'transId', 'resultCode', 'message', 'payType',
            'responseTime', 'extraData', 'accessKey', 'errorCode', 'localMessage'
        }

        sig_data = {k: v for k, v in data.items() if k in MOMO_KEYS and k != 'signature'}
        
        sig_data['accessKey'] = cls.ACCESS_KEY

        for k in sig_data:
            if sig_data[k] is None:
                sig_data[k] = ""
            else:
                sig_data[k] = str(sig_data[k])

        sorted_keys = sorted(sig_data.keys())

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
