from fastapi import HTTPException, UploadFile
from typing import List, Optional
import uuid
from datetime import datetime
from bson import ObjectId

from Models.SalaryModel import SupportingDocument
from Config.db import (
    warrent_collection,
    appointments_collection,
    services_collection,
    fs,
    requests_collection,
    employees_collection,
)
from Schemas.WarrentSchema import CreateWarrentSchema
from utils.helper import generate_qr_code


async def create_warrent_logic(
    warrent_data: CreateWarrentSchema, files: Optional[List[UploadFile]] = None
) -> dict:
    """Create a new warrant request with file uploads and auto-create request document"""
    try:
        warrent_dict = warrent_data.dict()
        warrent_dict["created_at"] = datetime.utcnow()

        # Handle file uploads if provided
        supporting_documents = []
        if files:
            for file in files:
                if file.filename:
                    file_content = await file.read()
                    file_id = await fs.upload_from_stream(
                        file.filename,
                        file_content,
                        metadata={
                            "content_type": file.content_type,
                            "upload_date": datetime.utcnow(),
                        },
                    )
                    doc_metadata = SupportingDocument(
                        file_id=str(file_id),
                        filename=file.filename,
                        content_type=file.content_type or "application/octet-stream",
                        upload_date=datetime.utcnow(),
                    )
                    supporting_documents.append(doc_metadata.dict())

        warrent_dict["supporting_documents"] = supporting_documents

        # Insert warrant into database FIRST
        warrent_result = await warrent_collection.insert_one(warrent_dict)
        warrent_id = str(warrent_result.inserted_id)

        # Create request document
        request_created = await _create_warrent_request(warrent_data, warrent_id)

        # Add request ID to warrant record
        await warrent_collection.update_one(
            {"_id": warrent_result.inserted_id},
            {"$set": {"request_id": request_created["request_id"]}},
        )

        return {
            "inserted_id": warrent_id,
            "message": "Warrant request created successfully",
            "files_uploaded": len(supporting_documents),
            "request_details": request_created,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating warrant: {str(e)}")


async def _create_warrent_request(
    warrent_data: CreateWarrentSchema, warrent_id: str
) -> dict:
    """Helper function to create a request document for warrant requests with GS→DS workflow"""
    try:
        # Find or create a default service for warrants
        warrent_service = await services_collection.find_one(
            {"serviceId": "service002"}
        )
        if not warrent_service:
            warrent_service = {
                "serviceId": "service002",
                "name": "Warrant Document Processing",
                "duration": 30,
                "description": "Processing of warrant requests and document verification",
            }
            await services_collection.insert_one(warrent_service)

        # Find GS handler (first handler)
        gs_handler = await employees_collection.find_one(
            {"GSDivision": warrent_data.Area, "role": "GS"}
        )
        if not gs_handler:
            gs_handler_id = "DEFAULT_GS001"
        else:
            gs_handler_id = str(gs_handler["_id"])

        # Parse and format time properly
        appointment_time = "10:00"
        if hasattr(warrent_data, "AppointmentTime") and warrent_data.AppointmentTime:
            time_str = warrent_data.AppointmentTime.strip()
            try:
                if "AM" in time_str.upper() or "PM" in time_str.upper():
                    time_obj = datetime.strptime(time_str, "%I:%M %p")
                    appointment_time = time_obj.strftime("%H:%M")
                else:
                    appointment_time = time_str
            except Exception:
                appointment_time = "10:00"

        # Create request data with GS as current handler and pending_gs status
        request_data = {
            "service_id": "service002",
            "service_name": warrent_service["name"],
            "status": "pending_gs",
            "created_at": datetime.utcnow(),
            "approved_at": None,
            "current_handler_id": gs_handler_id,
            "handler_history": [],
            "resource_id": warrent_id,
            "resource_name": "warrent",
            "priority": warrent_data.PriorityLevel.lower(),
            "requestAppointmentDate": warrent_data.AppointmentDate,
            "requestAppointmentTime": appointment_time,
            "Area": warrent_data.Area,
            "DSDivision": gs_handler["DSDivision"],
            "user_Id": warrent_data.UserId,
        }

        request_result = await requests_collection.insert_one(request_data)

        return {
            "request_id": str(request_result.inserted_id),
            "status": request_data["status"],
            "service_name": warrent_service["name"],
            "priority": request_data["priority"],
            "created_at": request_data["created_at"].isoformat(),
        }

    except Exception as e:
        raise Exception(f"Error creating request: {str(e)}")


async def approve_warrent_request_by_gs(request_id: str, gs_handler_id: str):
    """Approve by GS and forward to DS"""
    try:
        # Find the request
        request = await requests_collection.find_one({"_id": ObjectId(request_id)})
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        # Find DS handler for the same area
        ds_handler = await employees_collection.find_one(
            {"DSDivision": request["DSDivision"], "role": "DS"}
        )
        ds_handler_id = str(ds_handler["_id"]) if ds_handler else "DEFAULT_DS001"

        # Update request: set status to pending_ds, set current_handler_id, add to handler_history
        await requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "status": "pending_ds",
                    "current_handler_id": ds_handler_id,
                },
                "$push": {
                    "handler_history": {
                        "handler_id": gs_handler_id,
                        "action": "approved",
                        "timestamp": datetime.utcnow(),
                    }
                },
            },
        )
        return {"message": "Approved by GS and forwarded to DS."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in GS approval: {str(e)}")


async def approve_warrent_request_by_ds(request_id: str, ds_handler_id: str):
    """Approve by DS and mark as approved/issued"""
    try:
        request = await requests_collection.find_one({"_id": ObjectId(request_id)})
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        await requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "status": "approved",
                    "current_handler_id": None,
                    "approved_at": datetime.utcnow(),
                },
                "$push": {
                    "handler_history": {
                        "handler_id": ds_handler_id,
                        "action": "approved",
                        "timestamp": datetime.utcnow(),
                    }
                },
            },
        )
        return {"message": "Approved by DS. Warrant is now issued."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in DS approval: {str(e)}")


async def create_appointment_from_warrent_request(
    request_id: str, user_id: str
) -> dict:
    """Create appointment from approved warrant request"""
    try:
        request = await requests_collection.find_one(
            {"_id": ObjectId(request_id), "user_Id": user_id}
        )
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        if request["status"] != "approved":
            raise HTTPException(
                status_code=400,
                detail="Request must be approved before creating appointment",
            )

        warrent = await warrent_collection.find_one(
            {"_id": ObjectId(request["resource_id"])}
        )
        if not warrent:
            raise HTTPException(status_code=404, detail="Warrant not found")

        service = await services_collection.find_one(
            {"serviceId": request["service_id"]}
        )

        booking_reference = f"WR{uuid.uuid4().hex[:8].upper()}"

        appointment_data = {
            "service_id": request["service_id"],
            "service_name": service["name"],
            "date": request["requestAppointmentDate"],
            "time": request["requestAppointmentTime"],
            "user_Id": user_id,
            "user_name": warrent.get("fullname", ""),
            "booking_reference": booking_reference,
            "created_at": datetime.utcnow(),
            "status": "confirmed",
            "request_type": "warrent",
            "priority_level": warrent.get("PriorityLevel", "normal"),
            "request_id": str(request["_id"]),
        }

        qr_code_data = {
            "service_name": service["name"],
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "userId": user_id,
            "User_name": warrent.get("fullname", ""),
        }
        qr_code = generate_qr_code(booking_reference, qr_code_data)
        appointment_data["qr_code"] = qr_code

        appointment_result = await appointments_collection.insert_one(appointment_data)

        await requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "status": "appointment_created",
                    "appointment_id": str(appointment_result.inserted_id),
                }
            },
        )

        return {
            "appointment_id": str(appointment_result.inserted_id),
            "booking_reference": booking_reference,
            "date": appointment_data["date"],
            "time": appointment_data["time"],
            "service_name": service["name"],
            "qr_code": qr_code,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating appointment: {str(e)}"
        )


async def get_warrent_by_user_and_appointment_logic(
    user_id: str, appointment_id: str
) -> dict:
    """Get warrant by user ID and appointment ID"""
    try:

        appointment = await appointments_collection.find_one(
            {"_id": ObjectId(appointment_id), "user_Id": user_id}
        )
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        warrent = await warrent_collection.find_one(
            {"request_id": appointment.get("request_id")}
        )
        if not warrent:
            raise HTTPException(status_code=404, detail="Warrant not found")

        warrent["_id"] = str(warrent["_id"])

        return {
            "warrent": warrent,
            "appointment_details": {
                "appointment_id": str(appointment["_id"]),
                "booking_reference": appointment["booking_reference"],
                "date": appointment["date"],
                "time": appointment["time"],
                "status": appointment["status"],
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving warrant: {str(e)}"
        )


async def get_Warrents_logic() -> list:
    try:
        warrents_cursor = warrent_collection.find({})
        warrents = []
        async for warrent in warrents_cursor:
            warrent["_id"] = str(warrent["_id"])
            if "created_at" in warrent and isinstance(warrent["created_at"], datetime):
                warrent["created_at"] = warrent["created_at"].isoformat()
            if "supporting_documents" in warrent:
                for doc in warrent["supporting_documents"]:
                    if "upload_date" in doc and isinstance(doc["upload_date"], datetime):
                        doc["upload_date"] = doc["upload_date"].isoformat()
            warrents.append(warrent)
        return warrents
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching warrants: {str(e)}"
        )


async def get_requests_for_gs(gs_handler_id: str) -> list:
    cursor = requests_collection.find(
        {"current_handler_id": gs_handler_id, "status": "pending_gs"}
    )
    requests = []
    async for req in cursor:
        req["_id"] = str(req["_id"])
        requests.append(req)
    return requests


async def get_requests_for_ds(ds_handler_id: str) -> list:
    cursor = requests_collection.find(
        {"current_handler_id": ds_handler_id, "status": "pending_ds"}
    )
    requests = []
    async for req in cursor:
        req["_id"] = str(req["_id"])
        requests.append(req)
    return requests

async def get_warrents_by_userid_logic(user_id: str) -> list:
    """Get all warrants by user ID"""
    try:
        warrents_cursor = warrent_collection.find({"UserId": user_id})
        warrents = []
        async for warrent in warrents_cursor:
            warrent["_id"] = str(warrent["_id"])
            if "created_at" in warrent and isinstance(warrent["created_at"], datetime):
                warrent["created_at"] = warrent["created_at"].isoformat()
            if "supporting_documents" in warrent:
                for doc in warrent["supporting_documents"]:
                    if "upload_date" in doc and isinstance(doc["upload_date"], datetime):
                        doc["upload_date"] = doc["upload_date"].isoformat()
            warrents.append(warrent)
        return warrents
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving warrants: {str(e)}"
        )