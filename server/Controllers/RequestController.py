from fastapi import HTTPException
from datetime import datetime, timedelta

from Config.db import services_collection, requests_collection, users_collection


async def get_available_slots_logic(service_id: str, date: str, userId:str):
    """Get available time slots for a specific service and date"""
    try:

        user = await users_collection.find_one({"userId":userId})
        area = user["DSDivision"]

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
            existing_appointment = await requests_collection.find_one({
                "service_id": service_id,
                "requestAppointmentDate": date,
                "Area":area,
                "requestAppointmentTime": current_time.strftime("%H:%M"),
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
    

async def get_requests_users(serviceId:str, userId:str):
    try:
        requests_cursor = requests_collection.find({
            "service_id":serviceId,
            "user_Id": userId
        })
        
        requests = []
        async for request in requests_cursor:
            # Convert ObjectId to string for JSON serialization
            request["_id"] = str(request["_id"])
            requests.append(request)

        return requests
    
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error fetching requests: {str(err)}")

async def get_requests_employees(serviceId:str, empId:str):
    try:
        requests_cursor = requests_collection.find({
            "service_id":serviceId,
            "requestHandlerId": empId
        })
        
        requests = []
        async for request in requests_cursor:
            # Convert ObjectId to string for JSON serialization
            request["_id"] = str(request["_id"])
            requests.append(request)

        return requests
    
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error fetching requests: {str(err)}")