import qrcode
from io import BytesIO
import base64

# Helper function to generate QR code
def generate_qr_code(booking_reference: str, appointment_details: dict) -> str:
    qr_data = f"Booking Reference: {booking_reference}\n"
    qr_data += f"Service: {appointment_details['service_name']}\n"
    qr_data += f"Date: {appointment_details['date']}\n"
    qr_data += f"Time: {appointment_details['time']}\n"
    qr_data += f"UserId: {appointment_details['userId']}"
    qr_data += f"User: {appointment_details['User_name']}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"