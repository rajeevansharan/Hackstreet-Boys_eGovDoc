from fastapi import HTTPException, UploadFile, File
from typing import List, Optional
import uuid
from datetime import datetime

from Models.SalaryModel import salaryModel, SupportingDocument
from Models.AppointmentModel import Appointment
from Config.db import salary_particular_collection, appointments_collection, services_collection, fs
from Schemas.SalarySchema import CreateSalaryParticularSchema
from utils.helper import generate_qr_code

async def create_salary_particular_logic(
    salary_data: CreateSalaryParticularSchema,
    files: Optional[List[UploadFile]] = None
) -> dict:
    """Create a new salary particular request with file uploads and auto-create appointment"""
    try:
        # Convert schema to dict
        salary_dict = salary_data.dict()
        salary_dict["created_at"] = datetime.utcnow()
        
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
        
        # Auto-create appointment for salary particular service FIRST
        appointment_created = await _create_salary_appointment(salary_data)
        
        # Add appointment ID to salary particular record
        salary_dict["appointment_id"] = appointment_created["appointment_id"]
        
        # Insert salary particular into database
        salary_result = await salary_particular_collection.insert_one(salary_dict)
        
        return {
            "inserted_id": str(salary_result.inserted_id),
            "message": "Salary particular request and appointment created successfully",
            "files_uploaded": len(supporting_documents),
            "appointment_details": appointment_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating salary particular: {str(e)}")


async def _create_salary_appointment(salary_data: CreateSalaryParticularSchema) -> dict:
    """Helper function to automatically create appointment for salary particular requests"""
    try:
        # Find or create a default service for salary particulars
        salary_service = await services_collection.find_one({"serviceId": "service001"})
        
        # If service doesn't exist, create it
        if not salary_service:
            salary_service = {
                "serviceId": "salary-particular-service",
                "name": "Salary Particular Document Processing",
                "duration": 30,
                "description": "Processing of salary particular requests and document verification"
            }
            await services_collection.insert_one(salary_service)
        
        # Generate booking reference
        booking_reference = f"SP{uuid.uuid4().hex[:8].upper()}"
        
        
        # Create appointment data
        appointment_data = {
            "service_id": "service001",
            "service_name": salary_service["name"],
            "date": salary_data.AppointmentDate.strftime("%Y-%m-%d"),
            "time": salary_data.AppointmentTime or "10:00",  # Default time if not provided
            "user_Id": salary_data.UserId,
            "user_name": salary_data.fullname,
            "booking_reference": booking_reference,
            "created_at": datetime.utcnow(),
            "status": "submitted",
            "request_type": "salary_particular",  # Additional field to identify the source
            "pension_id": salary_data.PensionID,
            "priority_level": salary_data.PriorityLevel
        }
        
        # Generate QR code
        qr_code_data = {
            "service_name": salary_service["name"],
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "userId": salary_data.UserId,
            "User_name": salary_data.fullname
        }
        qr_code = generate_qr_code(booking_reference, qr_code_data)
        appointment_data["qr_code"] = qr_code
        
        # Save appointment to database
        appointment_result = await appointments_collection.insert_one(appointment_data)
        appointment_data["_id"] = str(appointment_result.inserted_id)
        
        return {
            "appointment_id": str(appointment_result.inserted_id),
            "booking_reference": booking_reference,
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "service_name": salary_service["name"],
            "qr_code": qr_code
        }
        
    except Exception as e:
        raise Exception(f"Error creating appointment: {str(e)}")
    

async def get_salary_particular_by_user_and_appointment_logic(user_id: str, appointment_id: str) -> dict:
    """Get salary particular by both user ID and appointment ID"""
    try:
        salary = await salary_particular_collection.find_one({
            "UserId": user_id,
            "appointment_id": appointment_id
        })
        if not salary:
            raise HTTPException(status_code=404, detail="Salary particular not found for this user and appointment")
        
        salary["_id"] = str(salary["_id"])
        # Convert datetime objects to ISO strings
        if "AppointmentDate" in salary and isinstance(salary["AppointmentDate"], datetime):
            salary["AppointmentDate"] = salary["AppointmentDate"].isoformat()
        if "created_at" in salary and isinstance(salary["created_at"], datetime):
            salary["created_at"] = salary["created_at"].isoformat()
        
        return salary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching salary particular: {str(e)}")
