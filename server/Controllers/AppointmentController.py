from fastapi import HTTPException
from datetime import datetime, timedelta
import uuid
from typing import List

from Config.db import services_collection, appointments_collection
from Schemas.AppointmentSchema import AppointmentCreateSchema
from Models.AppointmentModel import Appointment
from utils.helper import generate_qr_code

async def get_available_slots_logic(service_id: str, date: str):
    """Get available time slots for a specific service and date"""
    try:
        # Verify service exists
        service = await services_collection.find_one({"serviceId": service_id})
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        # Parse the date
        target_date = datetime.strptime(date, "%Y-%m-%d")
        
        # Generate time slots (9 AM to 5 PM, every 30 minutes)
        slots = []
        start_time = target_date.replace(hour=9, minute=0)
        end_time = target_date.replace(hour=17, minute=0)
        
        current_time = start_time
        while current_time < end_time:
            # Check if slot is already booked
            existing_appointment = await appointments_collection.find_one({
                "service_id": service_id,
                "date": date,
                "time": current_time.strftime("%H:%M"),
                "status": {"$ne": "rejected"}
            })
            
            if not existing_appointment:
                slots.append({
                    "time": current_time.strftime("%H:%M"),
                    "available": True
                })
            
            current_time += timedelta(minutes=30)
        
        return {"date": date, "available_slots": slots}
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

async def create_appointment_logic(appointment: AppointmentCreateSchema):
    """Create a new appointment"""
    try:
        # Verify service exists
        service = await services_collection.find_one({"serviceId": appointment.service_id})
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Check if slot is available
        existing_appointment = await appointments_collection.find_one({
            "service_id": appointment.service_id,
            "date": appointment.date,
            "time": appointment.time,
            "status": "confirmed"
        })
        
        if existing_appointment:
            raise HTTPException(status_code=400, detail="Time slot is already booked")
        
        # Generate booking reference
        booking_reference = f"BK{uuid.uuid4().hex[:8].upper()}"
        
        # Create appointment data
        appointment_data = {
            "service_id": appointment.service_id,
            "service_name": service["name"],
            "date": appointment.date,
            "time": appointment.time,
            "user_Id": appointment.userId,
            "user_name": appointment.user_name,
            "booking_reference": booking_reference,
            "created_at": datetime.utcnow(),
            "status": "confirmed"
        }
    

        # Generate QR code
        qr_code_data = {
            "service_name": service["name"],
            "date": appointment.date,
            "time": appointment.time,
            "userId": appointment.userId,
            "User_name": appointment.user_name
        }
        qr_code = generate_qr_code(booking_reference, qr_code_data)
        appointment_data["qr_code"] = qr_code
        
        # Save to database
        result = await appointments_collection.insert_one(appointment_data)
        appointment_data["_id"] = str(result.inserted_id)
        
        return Appointment(**appointment_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))