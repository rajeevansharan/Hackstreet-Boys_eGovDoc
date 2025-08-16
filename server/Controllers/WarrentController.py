from fastapi import HTTPException, UploadFile
from typing import List, Optional, Dict, Set
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


async def _create_warrent_request(warrent_data: CreateWarrentSchema, warrent_id: str) -> dict:
    """Helper function to create a request document for warrant requests with GS→DS workflow"""
    try:
        # Find or create a default service for warrants
        warrant_service = await services_collection.find_one({"serviceId": "service002"})
        
        # If service doesn't exist, create it
        if not warrant_service:
            # Create default service for warrants
            warrant_service_data = {
                "serviceId": "service002",
                "name": "Travel Warrant Request",
                "description": "Request for travel warrant processing",
                "department": "Pension Department",
                "created_at": datetime.utcnow()
            }
            service_result = await services_collection.insert_one(warrant_service_data)
            warrant_service = await services_collection.find_one({"_id": service_result.inserted_id})
            if not warrant_service:
                raise HTTPException(status_code=500, detail="Failed to create service")

        # Find request handler based on area
        requestHandler = await employees_collection.find_one({"DSDivision": warrent_data.Area})
        
        # Set default handler if none found for the area
        handler_id = None
        if not requestHandler:
            # Find a default handler or system admin
            default_handler = await employees_collection.find_one({"role": "admin"})
            if default_handler:
                handler_id = str(default_handler["_id"])
            else:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No handler found for area {warrent_data.Area} and no default handler available"
                )
        else:
            handler_id = str(requestHandler["_id"])
        
        # Create the request document
        request_data = {
            "service_id": str(warrant_service["_id"]),
            "user_id": warrent_data.UserId,
            "resource_id": warrent_id,
            "request_type": "travel_warrant",
            "status": "pending_gs",  # Initial status pending GS approval
            "current_handler_id": handler_id,
            "priority": warrent_data.PriorityLevel,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "appointment_date": warrent_data.AppointmentDate,
            "appointment_time": warrent_data.AppointmentTime,
        }
        
        # Insert the request
        request_result = await requests_collection.insert_one(request_data)
        
        # Return request details
        return {
            "request_id": str(request_result.inserted_id),
            "status": "pending_gs",
            "handler_id": handler_id,
            "message": "Request created successfully and assigned to handler"
        }
        
    except Exception as e:
        print(f"Error creating request: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating request: {str(e)}")


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
                    if "upload_date" in doc and isinstance(
                        doc["upload_date"], datetime
                    ):
                        doc["upload_date"] = doc["upload_date"].isoformat()
            warrents.append(warrent)
        return warrents
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching warrants: {str(e)}"
        )


async def get_requests_for_gs(gs_handler_id: str) -> List[dict]:
    """
    Return only the warrant documents related to a GS (by handler_id).
    Matches requests where:
      - current_handler_id == gs_handler_id, or
      - handler_history contains handler_id == gs_handler_id
    Uses request.resource_name == 'warrent' and request.resource_id to fetch warrants.
    """
    try:
        query = {
            "resource_name": "warrent",  # use resource_name (request_type may not exist)
            "$or": [
                {"current_handler_id": gs_handler_id},
                {"handler_history": {"$elemMatch": {"handler_id": gs_handler_id}}},
            ],
        }

        results: List[dict] = []
        seen: Set[str] = set()
        cursor = requests_collection.find(query)

        async for req in cursor:
            res_id = req.get("resource_id")
            if not res_id or res_id in seen:
                continue
            seen.add(res_id)

            try:
                warr = await warrent_collection.find_one({"_id": ObjectId(res_id)})
            except Exception:
                warr = None

            if not warr:
                continue

            # sanitize for JSON
            warr["_id"] = str(warr["_id"])
            for dt_field in (
                "TravelDate",
                "ReturnDate",
                "DateOfRetirement",
                "created_at",
            ):
                if dt_field in warr and isinstance(warr[dt_field], datetime):
                    warr[dt_field] = warr[dt_field].isoformat()

            if "supporting_documents" in warr:
                for doc in warr["supporting_documents"]:
                    if "upload_date" in doc and isinstance(
                        doc["upload_date"], datetime
                    ):
                        doc["upload_date"] = doc["upload_date"].isoformat()

            results.append(warr)

        return results

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching GS warrants: {str(e)}"
        )


async def get_requests_for_ds(ds_handler_id: str) -> List[dict]:
    """
    Return only the warrant documents related to a DS (by handler_id).
    Matches requests where:
      - current_handler_id == ds_handler_id, or
      - handler_history contains handler_id == ds_handler_id
    Uses request.resource_name == 'warrent' and request.resource_id to fetch warrants.
    """
    try:
        query = {
            "resource_name": "warrent",
            "$or": [
                {"current_handler_id": ds_handler_id},
                {"handler_history": {"$elemMatch": {"handler_id": ds_handler_id}}},
            ],
        }

        results: List[dict] = []
        seen: Set[str] = set()
        cursor = requests_collection.find(query)

        async for req in cursor:
            res_id = req.get("resource_id")
            if not res_id or res_id in seen:
                continue
            seen.add(res_id)

            try:
                warr = await warrent_collection.find_one({"_id": ObjectId(res_id)})
            except Exception:
                warr = None

            if not warr:
                continue

            # sanitize for JSON
            warr["_id"] = str(warr["_id"])
            for dt_field in (
                "TravelDate",
                "ReturnDate",
                "DateOfRetirement",
                "created_at",
            ):
                if dt_field in warr and isinstance(warr[dt_field], datetime):
                    warr[dt_field] = warr[dt_field].isoformat()

            if "supporting_documents" in warr:
                for doc in warr["supporting_documents"]:
                    if "upload_date" in doc and isinstance(
                        doc["upload_date"], datetime
                    ):
                        doc["upload_date"] = doc["upload_date"].isoformat()

            results.append(warr)

        return results

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching DS warrants: {str(e)}"
        )


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
                    if "upload_date" in doc and isinstance(
                        doc["upload_date"], datetime
                    ):
                        doc["upload_date"] = doc["upload_date"].isoformat()
            warrents.append(warrent)
        return warrents
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving warrants: {str(e)}"
        )


async def reject_warrent_request(
    request_id: str, handler_id: Optional[str] = None, reason: Optional[str] = None
) -> dict:
    """Reject a warrant request. Marks status=rejected and logs history if handler provided."""
    try:
        request = await requests_collection.find_one({"_id": ObjectId(request_id)})
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        if request.get("status") in ("approved", "appointment_created", "rejected"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reject a request in status '{request.get('status')}'",
            )

        update_set = {
            "status": "rejected",
            "current_handler_id": None,
            "rejected_at": datetime.utcnow(),
        }
        if reason is not None:
            update_set["rejection_reason"] = reason

        update_doc = {"$set": update_set}

        # Only push handler history if we have a handler_id
        if handler_id:
            update_doc["$push"] = {
                "handler_history": {
                    "handler_id": handler_id,
                    "action": "rejected",
                    "reason": reason,
                    "timestamp": datetime.utcnow(),
                }
            }

        await requests_collection.update_one({"_id": ObjectId(request_id)}, update_doc)
        return {"message": "Request rejected", "request_id": request_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error rejecting request: {str(e)}"
        )
