from fastapi import HTTPException, UploadFile, File
from typing import List, Optional
import uuid
from datetime import datetime

from Models.SalaryModel import salaryModel, SupportingDocument
from Models.AppointmentModel import Appointment
from Models.RequestModel import Request
from Config.db import salary_particular_collection, appointments_collection, services_collection, fs, requests_collection, employees_collection
from Schemas.SalarySchema import CreateSalaryParticularSchema
from utils.helper import generate_qr_code

async def create_salary_particular_logic(
    salary_data: CreateSalaryParticularSchema,
    files: Optional[List[UploadFile]] = None
) -> dict:
    """Create a new salary particular request with file uploads and auto-create request document"""
    try:
        # Convert schema to dict
        salary_dict = salary_data.dict()
        salary_dict["created_at"] = datetime.utcnow()

        # Convert datetime fields to strings for consistent storage
        if isinstance(salary_dict["AppointmentDate"], datetime):
            salary_dict["AppointmentDate"] = salary_dict["AppointmentDate"].strftime("%Y-%m-%d")
        
        # Handle file uploads if provided
        supporting_documents = []
        if files:
            for file in files:
                if file.filename:  # Check if file is actually uploaded
                    # Read file content
                    file_content = await file.read()
                    
                    # Upload to GridFS
                    file_id = await fs.upload_from_stream(
                        file.filename,
                        file_content,
                        metadata={
                            "content_type": file.content_type,
                            "upload_date": datetime.utcnow(),
                            "uploaded_by": salary_data.UserId
                        }
                    )
                    
                    # Create supporting document metadata
                    doc_metadata = SupportingDocument(
                        file_id=str(file_id),
                        filename=file.filename,
                        content_type=file.content_type or "application/octet-stream",
                        upload_date=datetime.utcnow()
                    )
                    supporting_documents.append(doc_metadata.dict())
        
        # Add supporting documents to salary data
        salary_dict["supporting_documents"] = supporting_documents
        
        # Insert salary particular into database FIRST
        salary_result = await salary_particular_collection.insert_one(salary_dict)
        salary_id = str(salary_result.inserted_id)
        
        # Create request document
        request_created = await _create_salary_request(salary_data, salary_id)
        
        # Add request ID to salary particular record
        await salary_particular_collection.update_one(
            {"_id": salary_result.inserted_id},
            {"$set": {"request_id": request_created["request_id"]}}
        )
        
        return {
            "inserted_id": salary_id,
            "message": "Salary particular request created successfully",
            "files_uploaded": len(supporting_documents),
            "request_details": request_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating salary particular: {str(e)}")
    

async def _create_salary_request(salary_data: CreateSalaryParticularSchema, salary_id: str) -> dict:
    """Helper function to create a request document for salary particular requests"""
    try:
        # Find or create a default service for salary particulars
        salary_service = await services_collection.find_one({"serviceId": "service001"})
        
        # If service doesn't exist, create it
        if not salary_service:
            salary_service = {
                "serviceId": "service001",
                "name": "Salary Particular Document Processing",
                "duration": 30,
                "description": "Processing of salary particular requests and document verification"
            }
            await services_collection.insert_one(salary_service)

        # Find request handler based on area (with proper error handling)
        requestHandler = await employees_collection.find_one({"DSDivision": salary_data.Area})
        if not requestHandler:
            # If no specific handler found, use a default handler ID
            handler_id = "DEFAULT_GS001"
        else:
            handler_id = str(requestHandler["_id"])
        
        # Parse and format time properly
        if salary_data.AppointmentTime:
            # Parse time string like "10:30 AM" to "10:30"
            time_str = salary_data.AppointmentTime.strip()
            try:
                # Handle AM/PM format
                if 'AM' in time_str.upper() or 'PM' in time_str.upper():
                    time_obj = datetime.strptime(time_str, "%I:%M %p")
                    appointment_time = time_obj.strftime("%H:%M")
                else:
                    appointment_time = time_str
            except:
                appointment_time = "10:00"  # Fallback
        else:
            appointment_time = "10:00"  # Default time
        
        # Create request data with proper string formats
        request_data = {
            "service_id": "service001",
            "service_name": salary_service["name"],
            "status": "pending",
            "created_at": datetime.utcnow(),
            "approved_at": None,
            "requestHandlerId": handler_id,
            "user_Id": salary_data.UserId,
            "resource_id": salary_id,
            "resource_name": "salary_particular",
            "priority": salary_data.PriorityLevel.lower(),
            # Store as strings to avoid MongoDB datetime conversion
            "requestAppointmentDate": salary_data.AppointmentDate.strftime("%Y-%m-%d"),
            "requestAppointmentTime": appointment_time,
            "Area":salary_data.Area
        }
        
        # Save request to database
        request_result = await requests_collection.insert_one(request_data)
        
        return {
            "request_id": str(request_result.inserted_id),
            "status": request_data["status"],
            "service_name": salary_service["name"],
            "priority": request_data["priority"],
            "created_at": request_data["created_at"].isoformat()
        }
        
    except Exception as e:
        raise Exception(f"Error creating request: {str(e)}")


async def create_appointment_from_request(request_id: str, user_id: str) -> dict:
    """Isolated function to create appointment from approved request"""
    try:
        # Convert string request_id to ObjectId for MongoDB query
        from bson import ObjectId
        
        # Get request details
        request = await requests_collection.find_one({"_id": ObjectId(request_id), "user_Id": user_id})
        
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request["status"] != "approved":
            raise HTTPException(status_code=400, detail="Request must be approved before creating appointment")
        
        # Get salary particular details - convert resource_id to ObjectId
        salary = await salary_particular_collection.find_one({"_id": ObjectId(request["resource_id"])})
        if not salary:
            raise HTTPException(status_code=404, detail="Salary particular not found")
        
        # Find service
        service = await services_collection.find_one({"serviceId": request["service_id"]})
        
        # Generate booking reference
        booking_reference = f"SP{uuid.uuid4().hex[:8].upper()}"
        
        # Create appointment data
        appointment_data = {
            "service_id": request["service_id"],
            "service_name": service["name"],
            "date": request["requestAppointmentDate"].strftime("%Y-%m-%d"),
            "time": request["requestAppointmentTime"].strftime("%H:%M"),
            "user_Id": user_id,
            "user_name": salary["fullname"],
            "booking_reference": booking_reference,
            "created_at": datetime.utcnow(),
            "status": "confirmed",
            "request_type": "salary_particular",
            "pension_id": salary["PensionID"],
            "priority_level": salary["PriorityLevel"],
            "request_id": str(request["_id"])
        }
        
        # Generate QR code
        qr_code_data = {
            "service_name": service["name"],
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "userId": user_id,
            "User_name": salary["fullname"]
        }
        qr_code = generate_qr_code(booking_reference, qr_code_data)
        appointment_data["qr_code"] = qr_code
        
        # Save appointment to database
        appointment_result = await appointments_collection.insert_one(appointment_data)
        
        # Update request status to indicate appointment created
        await requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "appointment_created", "appointment_id": str(appointment_result.inserted_id)}}
        )
        
        return {
            "appointment_id": str(appointment_result.inserted_id),
            "booking_reference": booking_reference,
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "service_name": service["name"],
            "qr_code": qr_code
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating appointment: {str(e)}")


async def get_salary_particular_by_user_and_appointment_logic(user_id: str, appointment_id: str) -> dict:
    """Get salary particular by user ID and appointment ID"""
    try:
        from bson import ObjectId
        
        # Find appointment first
        appointment = await appointments_collection.find_one({"_id": ObjectId(appointment_id), "user_Id": user_id})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Find salary particular using the request_id from appointment
        salary = await salary_particular_collection.find_one({"request_id": appointment.get("request_id")})
        if not salary:
            raise HTTPException(status_code=404, detail="Salary particular not found")
        
        # Convert ObjectId to string for JSON serialization
        salary["_id"] = str(salary["_id"])
        
        return {
            "salary_particular": salary,
            "appointment_details": {
                "appointment_id": str(appointment["_id"]),
                "booking_reference": appointment["booking_reference"],
                "date": appointment["date"],
                "time": appointment["time"],
                "status": appointment["status"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving salary particular: {str(e)}")