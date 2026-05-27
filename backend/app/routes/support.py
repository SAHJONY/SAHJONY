"""
Customer Support Routes for SAHJONY Support Brain
==================================================

Provides API endpoints for the multi-agent customer support system.
"""

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import Optional
import json

from ..middleware.auth import get_current_user_id, verify_bearer_token
from ..services.support_brain import support_brain, InquiryType, Priority, TicketAgent, SupportTicket

router = APIRouter(tags=["Customer Support"])


@router.get("/support/status")
async def get_support_status():
    """Get customer support system status and capabilities."""
    return {
        "status": "active",
        "name": "SAHJONY Support Brain",
        "description": "Multi-agent customer support with triage, FAQ, and ticket management",
        **support_brain.get_capabilities()
    }


@router.post("/support/chat")
async def support_chat(
    message: str,
    customer_name: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """
    Process a customer support message through the multi-agent pipeline.
    
    Returns a streaming response with triage, FAQ lookup, and/or ticket creation.
    """
    try:
        result = ""
        async for chunk in support_brain.process_support_message(
            customer_id=user_id,
            customer_name=customer_name or "Customer",
            message=message
        ):
            result += chunk
        
        return {"response": result, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Support processing failed: {str(e)}")


@router.get("/support/knowledge-base/search")
async def search_knowledge_base(
    query: str,
    max_results: int = 5,
    user_id: str = Depends(get_current_user_id)
):
    """Search the knowledge base for relevant FAQs."""
    from ..services.support_brain import KnowledgeBase
    
    kb = KnowledgeBase()
    results = kb.search(query, max_results)
    
    return {
        "query": query,
        "results": [
            {
                "id": faq.id,
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category,
                "tags": faq.tags
            }
            for faq in results
        ],
        "count": len(results)
    }


@router.get("/support/knowledge-base/categories")
async def get_knowledge_base_categories(
    user_id: str = Depends(get_current_user_id)
):
    """Get all available knowledge base categories."""
    from ..services.support_brain import KnowledgeBase
    
    kb = KnowledgeBase()
    
    # Get unique categories
    categories = set()
    for entry in kb.entries:
        categories.add(entry.category)
    
    return {
        "categories": sorted(list(categories)),
        "total_articles": len(kb.entries)
    }


@router.post("/support/ticket/create")
async def create_support_ticket(
    subject: str,
    description: str,
    inquiry_type: str = "general",
    priority: str = "medium",
    user_id: str = Depends(get_current_user_id)
):
    """Create a new support ticket."""
    try:
        # Create ticket directly
        # Access the class-level counter and increment it
        current_counter = TicketAgent.counter
        TicketAgent._ticket_counter = current_counter + 1
        ticket_id = f"TICKET-{TicketAgent._ticket_counter:04d}"
        
        # Safely map string to enum, default to GENERAL/LOW if invalid
        try:
            inquiry_enum = InquiryType[inquiry_type.upper()]
        except KeyError:
            inquiry_enum = InquiryType.GENERAL
        
        try:
            priority_enum = Priority[priority.upper()]
        except KeyError:
            priority_enum = Priority.MEDIUM
        
        ticket = SupportTicket(
            id=ticket_id,
            customer_id=user_id,
            subject=subject,
            description=description,
            inquiry_type=inquiry_enum,
            priority=priority_enum,
            status="open"
        )
        
        TicketAgent.tickets[ticket_id] = ticket
        
        return {
            "success": True,
            "ticket": {
                "id": ticket.id,
                "subject": ticket.subject,
                "status": ticket.status,
                "priority": ticket.priority.value
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket creation failed: {str(e)}")


@router.get("/support/ticket/{ticket_id}")
async def get_ticket_status(
    ticket_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get the status of a support ticket."""
    from ..services.support_brain import TicketAgent
    
    # Check if ticket exists in memory (in real app, would query database)
    ticket = TicketAgent.tickets.get(ticket_id)
    
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    
    # Verify ownership
    if ticket.customer_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this ticket")
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority.value,
        "inquiry_type": ticket.inquiry_type.value,
        "created_at": ticket.created_at,
        "assigned_agent": ticket.assigned_agent
    }


@router.get("/support/tickets")
async def list_support_tickets(
    user_id: str = Depends(get_current_user_id)
):
    """List all support tickets for the current user."""
    from ..services.support_brain import TicketAgent
    
    # Filter tickets for this user (in real app, would query database)
    customer_tickets = [
        t for t in TicketAgent.tickets.values()
        if t.customer_id == user_id
    ]
    
    return {
        "tickets": [
            {
                "id": ticket.id,
                "subject": ticket.subject,
                "status": ticket.status,
                "priority": ticket.priority.value,
                "created_at": ticket.created_at
            }
            for ticket in customer_tickets
        ],
        "count": len(customer_tickets)
    }


@router.post("/support/feedback")
async def submit_feedback(
    ticket_id: str,
    rating: int,
    comment: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Submit satisfaction feedback for a support ticket."""
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    from ..services.support_brain import TicketAgent
    
    ticket = TicketAgent.tickets.get(ticket_id)
    
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    
    # Update ticket with feedback
    ticket.satisfaction_rating = rating
    
    return {
        "success": True,
        "message": "Thank you for your feedback!",
        "rating": rating
    }


@router.websocket("/ws/support/{session_id}")
async def websocket_support_chat(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time support chat.
    """
    # Get token from query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return
    
    # Verify user
    user_id = verify_bearer_token(token)
    if not user_id:
        await websocket.close(code=4002, reason="Invalid authentication token")
        return
    
    await websocket.accept()
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")
                customer_name = message_data.get("customer_name", "Customer")
                
                if not content:
                    await websocket.send_json({"error": "Empty message content"})
                    continue
                
                # Send typing indicator
                await websocket.send_json({"type": "typing", "content": ""})
                
                # Process through support brain
                full_response = ""
                async for chunk in support_brain.process_support_message(
                    customer_id=user_id,
                    customer_name=customer_name,
                    message=content
                ):
                    full_response += chunk
                    await websocket.send_json({
                        "type": "chunk",
                        "content": chunk
                    })
                
                # Send completion
                await websocket.send_json({
                    "type": "done",
                    "full_response": full_response
                })
                
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
                
    except WebSocketDisconnect:
        pass  # Client disconnected gracefully
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except:
            pass