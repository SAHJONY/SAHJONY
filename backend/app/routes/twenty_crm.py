"""
Twenty CRM Integration Routes

Provides API endpoints to connect SAHJONY with Twenty CRM.
Allows syncing contacts, companies, opportunities, and tasks.

Base URL: /api/twenty
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List, Any
import logging
import asyncio

from ..services.twenty_client import get_twenty_client, TwentyConfig, init_twenty_client
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/twenty", tags=["Twenty CRM"])


# ============ REQUEST/RESPONSE MODELS ============

class TwentyConfigRequest(BaseModel):
    """Request to configure Twenty API credentials"""
    api_key: str
    api_url: Optional[str] = "https://api.twenty.com/graphql"


class ContactCreateRequest(BaseModel):
    """Request to create a contact"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    company_id: Optional[str] = None


class ContactUpdateRequest(BaseModel):
    """Request to update a contact"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None


class CompanyCreateRequest(BaseModel):
    """Request to create a company"""
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    employees: Optional[int] = None


class CompanyUpdateRequest(BaseModel):
    """Request to update a company"""
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None


class OpportunityCreateRequest(BaseModel):
    """Request to create an opportunity/deal"""
    name: str
    amount: Optional[float] = None
    stage: Optional[str] = None
    company_id: Optional[str] = None
    close_date: Optional[str] = None


class OpportunityUpdateRequest(BaseModel):
    """Request to update an opportunity"""
    name: Optional[str] = None
    amount: Optional[float] = None
    stage: Optional[str] = None
    close_date: Optional[str] = None


class TaskCreateRequest(BaseModel):
    """Request to create a task"""
    title: str
    status: Optional[str] = "pending"
    due_date: Optional[str] = None
    assignee_id: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    """Request to update a task"""
    title: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None


class SyncContactsRequest(BaseModel):
    """Request to sync contacts from external source to Twenty"""
    contacts: List[ContactCreateRequest]


class SyncResult(BaseModel):
    """Result of a sync operation"""
    success: bool
    synced: int
    failed: int
    errors: List[str] = []


# ============ HELPER FUNCTIONS ============

def get_client() -> Any:
    """Get the configured Twenty client or raise an error"""
    client = get_twenty_client()
    if not client.api_key:
        raise HTTPException(
            status_code=503,
            detail="Twenty CRM not configured. Please set TWENTY_API_KEY."
        )
    return client


# ============ CONFIGURATION ENDPOINTS ============

@router.post("/configure")
async def configure_twenty(config: TwentyConfigRequest):
    """
    Configure Twenty CRM API credentials.
    
    Store the API key securely for subsequent requests.
    """
    try:
        client = init_twenty_client(config.api_key, config.api_url)
        
        # Verify the credentials work
        healthy = await client.health_check()
        if not healthy:
            raise HTTPException(status_code=401, detail="Invalid Twenty API credentials")
        
        logger.info("Twenty CRM configured successfully")
        return {"status": "configured", "message": "Twenty CRM connected successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to configure Twenty: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def twenty_status():
    """
    Check Twenty CRM connection status.
    
    Returns whether the API key is configured and if the connection is healthy.
    """
    client = get_twenty_client()
    
    if not client.api_key:
        return {
            "configured": False,
            "healthy": False,
            "message": "Twenty API key not configured"
        }
    
    try:
        healthy = await client.health_check()
        return {
            "configured": True,
            "healthy": healthy,
            "message": "Connected" if healthy else "Connection failed"
        }
    except Exception as e:
        return {
            "configured": True,
            "healthy": False,
            "message": str(e)
        }


# ============ CONTACTS (PEOPLE) ENDPOINTS ============

@router.get("/contacts")
async def get_contacts(
    first: int = Query(10, ge=1, le=100, description="Number of contacts to fetch"),
    after: Optional[str] = Query(None, description="Pagination cursor")
):
    """
    Get all contacts from Twenty CRM.
    
    Returns paginated list of contacts with their details.
    """
    client = get_client()
    try:
        result = await client.get_contacts(first=first, after=after)
        return result.get("people", {})
    except Exception as e:
        logger.error(f"Failed to get contacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str):
    """
    Get a single contact by ID.
    """
    client = get_client()
    try:
        contact = await client.get_contact(contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        return contact
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/contacts")
async def create_contact(contact: ContactCreateRequest):
    """
    Create a new contact in Twenty CRM.
    """
    client = get_client()
    try:
        contact_data = {"name": contact.name}
        if contact.email:
            contact_data["email"] = contact.email
        if contact.phone:
            contact_data["phone"] = contact.phone
        if contact.job_title:
            contact_data["jobTitle"] = contact.job_title
            
        result = await client.create_contact(contact_data)
        return result.get("createPerson", {})
    except Exception as e:
        logger.error(f"Failed to create contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/contacts/{contact_id}")
async def update_contact(contact_id: str, contact: ContactUpdateRequest):
    """
    Update an existing contact.
    """
    client = get_client()
    try:
        contact_data = {}
        if contact.name:
            contact_data["name"] = contact.name
        if contact.email:
            contact_data["email"] = contact.email
        if contact.phone:
            contact_data["phone"] = contact.phone
        if contact.job_title:
            contact_data["jobTitle"] = contact.job_title
            
        result = await client.update_contact(contact_id, contact_data)
        return result.get("updatePerson", {})
    except Exception as e:
        logger.error(f"Failed to update contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ COMPANIES ENDPOINTS ============

@router.get("/companies")
async def get_companies(
    first: int = Query(10, ge=1, le=100),
    after: Optional[str] = None
):
    """
    Get all companies from Twenty CRM.
    """
    client = get_client()
    try:
        result = await client.get_companies(first=first, after=after)
        return result.get("companies", {})
    except Exception as e:
        logger.error(f"Failed to get companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/companies/{company_id}")
async def get_company(company_id: str):
    """
    Get a single company by ID.
    """
    client = get_client()
    try:
        company = await client.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get company: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/companies")
async def create_company(company: CompanyCreateRequest):
    """
    Create a new company in Twenty CRM.
    """
    client = get_client()
    try:
        company_data = {"name": company.name}
        if company.domain:
            company_data["domain"] = company.domain
        if company.industry:
            company_data["industry"] = company.industry
        if company.employees:
            company_data["employees"] = company.employees
            
        result = await client.create_company(company_data)
        return result.get("createCompany", {})
    except Exception as e:
        logger.error(f"Failed to create company: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ OPPORTUNITIES (DEALS) ENDPOINTS ============

@router.get("/opportunities")
async def get_opportunities(
    first: int = Query(10, ge=1, le=100),
    after: Optional[str] = None
):
    """
    Get all opportunities/deals from Twenty CRM.
    """
    client = get_client()
    try:
        result = await client.get_opportunities(first=first, after=after)
        return result.get("opportunities", {})
    except Exception as e:
        logger.error(f"Failed to get opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/opportunities/{opportunity_id}")
async def get_opportunity(opportunity_id: str):
    """
    Get a single opportunity by ID.
    """
    client = get_client()
    try:
        opportunity = await client.get_opportunity(opportunity_id)
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        return opportunity
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/opportunities")
async def create_opportunity(opportunity: OpportunityCreateRequest):
    """
    Create a new opportunity/deal in Twenty CRM.
    """
    client = get_client()
    try:
        opp_data = {"name": opportunity.name}
        if opportunity.amount is not None:
            opp_data["amount"] = opportunity.amount
        if opportunity.stage:
            opp_data["stage"] = opportunity.stage
        if opportunity.company_id:
            opp_data["companyId"] = opportunity.company_id
        if opportunity.close_date:
            opp_data["closeDate"] = opportunity.close_date
            
        result = await client.create_opportunity(opp_data)
        return result.get("createOpportunity", {})
    except Exception as e:
        logger.error(f"Failed to create opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/opportunities/{opportunity_id}")
async def update_opportunity(opportunity_id: str, opportunity: OpportunityUpdateRequest):
    """
    Update an existing opportunity.
    """
    client = get_client()
    try:
        opp_data = {}
        if opportunity.name:
            opp_data["name"] = opportunity.name
        if opportunity.amount is not None:
            opp_data["amount"] = opportunity.amount
        if opportunity.stage:
            opp_data["stage"] = opportunity.stage
        if opportunity.close_date:
            opp_data["closeDate"] = opportunity.close_date
            
        result = await client.update_opportunity(opportunity_id, opp_data)
        return result.get("updateOpportunity", {})
    except Exception as e:
        logger.error(f"Failed to update opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ TASKS ENDPOINTS ============

@router.get("/tasks")
async def get_tasks(
    first: int = Query(10, ge=1, le=100),
    after: Optional[str] = None
):
    """
    Get all tasks from Twenty CRM.
    """
    client = get_client()
    try:
        result = await client.get_tasks(first=first, after=after)
        return result.get("tasks", {})
    except Exception as e:
        logger.error(f"Failed to get tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """
    Get a single task by ID.
    """
    client = get_client()
    try:
        task = await client.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tasks")
async def create_task(task: TaskCreateRequest):
    """
    Create a new task in Twenty CRM.
    """
    client = get_client()
    try:
        task_data = {"title": task.title}
        if task.status:
            task_data["status"] = task.status
        if task.due_date:
            task_data["dueDate"] = task.due_date
        if task.assignee_id:
            task_data["assigneeId"] = task.assignee_id
            
        result = await client.create_task(task_data)
        return result.get("createTask", {})
    except Exception as e:
        logger.error(f"Failed to create task: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskUpdateRequest):
    """
    Update an existing task.
    """
    client = get_client()
    try:
        task_data = {}
        if task.title:
            task_data["title"] = task.title
        if task.status:
            task_data["status"] = task.status
        if task.due_date:
            task_data["dueDate"] = task.due_date
            
        result = await client.update_task(task_id, task_data)
        return result.get("updateTask", {})
    except Exception as e:
        logger.error(f"Failed to update task: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ SEARCH ENDPOINT ============

@router.get("/search")
async def search_twenty(
    q: str = Query(..., description="Search query"),
    types: Optional[str] = Query(None, description="Comma-separated list of types to search")
):
    """
    Search across all objects in Twenty CRM.
    
    Types can include: person, company, opportunity, task
    """
    client = get_client()
    try:
        type_list = types.split(",") if types else None
        result = await client.search_all(q, type_list)
        return result.get("search", {})
    except Exception as e:
        logger.error(f"Failed to search Twenty: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ SYNC ENDPOINTS ============

@router.post("/sync/contacts")
async def sync_contacts(sync_request: SyncContactsRequest):
    """
    Sync multiple contacts from an external source to Twenty CRM.
    
    This is useful for batch importing contacts from other CRMs or databases.
    Returns a summary of successful and failed syncs.
    Uses parallel processing for improved performance.
    """
    client = get_client()
    
    async def sync_single_contact(contact: ContactCreateRequest, semaphore: asyncio.Semaphore) -> tuple:
        """Sync a single contact and return (success, name, error)."""
        async with semaphore:
            try:
                contact_data = {"name": contact.name}
                if contact.email:
                    contact_data["email"] = contact.email
                if contact.phone:
                    contact_data["phone"] = contact.phone
                if contact.job_title:
                    contact_data["jobTitle"] = contact.job_title
                    
                await client.create_contact(contact_data)
                return (True, contact.name, None)
            except Exception as e:
                return (False, contact.name, str(e))
    
    # Limit concurrent API calls to prevent rate limiting
    semaphore = asyncio.Semaphore(5)
    
    # Process all contacts in parallel with concurrency limit
    results = await asyncio.gather(*[
        sync_single_contact(contact, semaphore) for contact in sync_request.contacts
    ])
    
    synced = sum(1 for success, _, _ in results if success)
    failed = sum(1 for success, _, _ in results if not success)
    errors = [f"Failed to sync {name}: {err}" for success, name, err in results if not success]
    
    return SyncResult(
        success=failed == 0,
        synced=synced,
        failed=failed,
        errors=errors
    )