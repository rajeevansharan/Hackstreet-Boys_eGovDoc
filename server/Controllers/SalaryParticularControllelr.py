from fastapi import HTTPException, UploadFile
from typing import List, Optional
import uuid
from datetime import datetime
from bson import ObjectId

from Models.SalaryModel import SupportingDocument, salaryModel
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

        # Convert date and time objects to strings for MongoDB
        salary_dict["AppointmentDate"] = salary_data.AppointmentDate.isoformat()
        salary_dict["AppointmentTime"] = salary_data.AppointmentTime.strftime("%H:%M") if salary_data.AppointmentTime else None
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
            "requestAppointmentDate": salary_data.AppointmentDate.isoformat(),
            "requestAppointmentTime": salary_data.AppointmentTime.strftime("%H:%M"),
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


async def get_salary_particular(resourceId: str) -> salaryModel:
    """Retrieve a specific salary particular document by its ID"""
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(resourceId):
            raise HTTPException(status_code=400, detail="Invalid resource ID format")
            
        resource = await salary_particular_collection.find_one({"_id": ObjectId(resourceId)})
        
        # Handle not found case
        if resource is None:
            raise HTTPException(status_code=404, detail=f"Salary particular with ID {resourceId} not found")
            
        # Convert MongoDB document to Pydantic model
        resource["_id"] = str(resource["_id"])  # Convert ObjectId to string
        return salaryModel(**resource)
        
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error fetching salary particular: {str(err)}")