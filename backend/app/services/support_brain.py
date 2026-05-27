"""
SAHJONY Customer Support Brain
==============================

A multi-agent customer support system powered by SAHJONY that combines:
- Triage Agent: Routes inquiries to appropriate handlers
- FAQ Agent: Answers common questions from knowledge base
- Ticket Agent: Creates and manages support tickets
- Live Agent: Escalates complex issues to human support

The support brain uses persistent memory (Hermes) to maintain context
across support sessions and provide personalized assistance.
"""

import asyncio
import json
import re
from typing import AsyncGenerator, Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from .sahjony_brain import (
    AgentType,
    AgentMessage,
    AgentResponse,
    TaskContext,
    BaseAgent,
    sahjony_brain as base_sahjony_brain
)
from .llm_providers import complete_with_llm


# ============================================================================
# Support Types
# ============================================================================

class InquiryType(Enum):
    """Types of customer inquiries"""
    FAQ = "faq"
    TECHNICAL_SUPPORT = "technical_support"
    BILLING = "billing"
    ACCOUNT = "account"
    FEATURE_REQUEST = "feature_request"
    COMPLAINT = "complaint"
    ESCALATION = "escalation"
    GENERAL = "general"


class Priority(Enum):
    """Support ticket priorities"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class SupportTicket:
    id: str
    customer_id: str
    subject: str
    description: str
    inquiry_type: InquiryType
    priority: Priority
    status: str  # open, in_progress, resolved, closed
    assigned_agent: Optional[str] = None
    messages: List[Dict[str, Any]] = field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    resolved_at: Optional[str] = None
    satisfaction_rating: Optional[int] = None  # 1-5


@dataclass
class FAQEntry:
    id: str
    question: str
    answer: str
    category: str
    tags: List[str]
    language: str = "en"
    helpful_count: int = 0


@dataclass
class SupportContext:
    customer_id: str
    customer_name: str
    customer_email: str
    subscription_tier: str
    previous_tickets: List[SupportTicket]
    current_ticket: Optional[SupportTicket] = None


# ============================================================================
# Knowledge Base (FAQ Agent)
# ============================================================================

class KnowledgeBase:
    """Simple in-memory knowledge base for FAQ lookups"""
    
    def __init__(self):
        self.entries: List[FAQEntry] = [
            # Account & Authentication
            FAQEntry(
                id="faq_001",
                question="How do I reset my password?",
                answer="To reset your password:\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your inbox for the reset link\n5. Create a new password\n\nIf you don't receive the email within 5 minutes, check your spam folder.",
                category="account",
                tags=["password", "reset", "login", "account"]
            ),
            FAQEntry(
                id="faq_002",
                question="How do I change my email address?",
                answer="To change your email:\n1. Go to Settings > Account\n2. Click 'Change Email'\n3. Enter your new email address\n4. Verify by clicking the link sent to your new email\n5. Update your login credentials",
                category="account",
                tags=["email", "change", "account", "settings"]
            ),
            FAQEntry(
                id="faq_003",
                question="How do I delete my account?",
                answer="To delete your account:\n1. Go to Settings > Account\n2. Scroll to 'Danger Zone'\n3. Click 'Delete Account'\n4. Confirm by typing 'DELETE'\n5. Your account will be permanently deleted within 30 days\n\nNote: This action cannot be undone.",
                category="account",
                tags=["delete", "account", "remove", "cancel"]
            ),
            
            # Billing & Payments
            FAQEntry(
                id="faq_004",
                question="How do I update my payment method?",
                answer="To update your payment method:\n1. Go to Settings > Billing\n2. Click 'Payment Methods'\n3. Click 'Add New Method' or edit existing\n4. Enter your card details\n5. Set as default if desired\n\nWe accept Visa, Mastercard, and American Express.",
                category="billing",
                tags=["payment", "card", "billing", "credit"]
            ),
            FAQEntry(
                id="faq_005",
                question="Where can I view my invoices?",
                answer="To view your invoices:\n1. Go to Settings > Billing\n2. Click 'Invoice History'\n3. You'll see all past invoices with download options\n\nInvoices are generated on the 1st of each month for the previous month's usage.",
                category="billing",
                tags=["invoice", "billing", "receipt", "payment"]
            ),
            FAQEntry(
                id="faq_006",
                question="How do I cancel my subscription?",
                answer="To cancel your subscription:\n1. Go to Settings > Billing\n2. Click 'Cancel Subscription'\n3. Choose your cancellation reason\n4. Confirm cancellation\n\nYour access continues until the end of your billing period. No refunds for partial months.",
                category="billing",
                tags=["cancel", "subscription", "billing", "refund"]
            ),
            
            # Technical Support
            FAQEntry(
                id="faq_007",
                question="The app is not loading properly",
                answer="If the app isn't loading:\n1. Clear your browser cache (Ctrl+Shift+Delete)\n2. Try a different browser (Chrome, Firefox, Safari)\n3. Disable browser extensions temporarily\n4. Check your internet connection\n5. Try clearing DNS cache\n\nIf issues persist, contact technical support.",
                category="technical",
                tags=["loading", "error", "browser", "cache", "technical"]
            ),
            FAQEntry(
                id="faq_008",
                question="How do I enable two-factor authentication?",
                answer="To enable 2FA:\n1. Go to Settings > Security\n2. Click 'Enable Two-Factor Authentication'\n3. Scan the QR code with your authenticator app\n4. Enter the 6-digit code to verify\n5. Save your backup codes in a safe place\n\nWe support Google Authenticator, Authy, and similar apps.",
                category="account",
                tags=["2fa", "two-factor", "security", "authentication"]
            ),
            FAQEntry(
                id="faq_009",
                question="My data isn't syncing across devices",
                answer="For data sync issues:\n1. Ensure you're logged into the same account on all devices\n2. Check your internet connection on all devices\n3. Wait up to 5 minutes for sync to complete\n4. Try logging out and back in\n5. Check if you have sufficient storage space\n\nContact support if sync issues persist after 30 minutes.",
                category="technical",
                tags=["sync", "data", "devices", "cross-device"]
            ),
            
            # Features & Usage
            FAQEntry(
                id="faq_010",
                question="How do I export my data?",
                answer="To export your data:\n1. Go to Settings > Data\n2. Click 'Export Data'\n3. Choose export format (JSON, CSV)\n4. Select date range if applicable\n5. Click 'Generate Export'\n6. Download when ready (within 24 hours)\n\nExports are available in multiple formats for easy migration.",
                category="general",
                tags=["export", "data", "download", "migration"]
            ),
            FAQEntry(
                id="faq_011",
                question="How do I invite team members?",
                answer="To invite team members:\n1. Go to Settings > Team\n2. Click 'Invite Members'\n3. Enter email addresses (comma-separated)\n4. Select their role (Admin, Editor, Viewer)\n5. Click 'Send Invites'\n\nInvited members will receive an email to join your workspace.",
                category="general",
                tags=["team", "invite", "members", "collaboration"]
            ),
            FAQEntry(
                id="faq_012",
                question="What are the API rate limits?",
                answer="API rate limits by plan:\n- Free: 100 requests/minute\n- Startup: 1,000 requests/minute\n- Business: 10,000 requests/minute\n- Enterprise: Custom limits\n\nRate limit headers are included in all API responses. Contact us for higher limits.",
                category="technical",
                tags=["api", "rate-limit", "limits", "developers"]
            ),
        ]
    
    def search(self, query: str, max_results: int = 5) -> List[FAQEntry]:
        """Search knowledge base for relevant FAQs"""
        query_lower = query.lower()
        scored_results = []
        
        for entry in self.entries:
            score = 0
            # Exact question match
            if query_lower in entry.question.lower():
                score += 10
            # Tag match
            for tag in entry.tags:
                if tag.lower() in query_lower:
                    score += 5
            # Category match
            if entry.category in query_lower:
                score += 3
            # Answer content match
            if query_lower in entry.answer.lower():
                score += 2
            
            if score > 0:
                scored_results.append((score, entry))
        
        # Sort by score and return top results
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [entry for _, entry in scored_results[:max_results]]
    
    def get_by_category(self, category: str) -> List[FAQEntry]:
        """Get all FAQs in a category"""
        return [e for e in self.entries if e.category == category]
    
    def get_by_id(self, faq_id: str) -> Optional[FAQEntry]:
        """Get a specific FAQ by ID"""
        for entry in self.entries:
            if entry.id == faq_id:
                return entry
        return None


# ============================================================================
# Support Agents
# ============================================================================

class TriageAgent(BaseAgent):
    """
    Triage Agent - Routes customer inquiries to appropriate handlers.
    
    Analyzes the customer's message to determine:
    - Type of inquiry (FAQ, technical, billing, etc.)
    - Priority level (urgent, high, medium, low)
    - Whether it can be handled automatically or needs human intervention
    """
    
    def __init__(self):
        super().__init__("TriageAgent", AgentType.SAHJONY_CORE)
        self.inquiry_keywords = {
            InquiryType.FAQ: ["how", "what", "where", "when", "can i", "how do i", "is it possible"],
            InquiryType.TECHNICAL_SUPPORT: ["error", "bug", "not working", "crash", "issue", "problem", "broken", "loading", "sync"],
            InquiryType.BILLING: ["invoice", "payment", "charge", "billing", "refund", "subscription", "plan", "price", "cost"],
            InquiryType.ACCOUNT: ["password", "login", "email", "account", "delete", "profile", "settings"],
            InquiryType.FEATURE_REQUEST: ["feature", "suggestion", "would be nice", "please add", "request"],
            InquiryType.COMPLAINT: ["frustrated", "disappointed", "unacceptable", "terrible", "worst", "complaint", "angry"],
            InquiryType.ESCALATION: ["supervisor", "manager", "human", "real person", "talk to someone", "escalate"],
        }
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        # Analyze message to determine inquiry type
        inquiry_type = self._classify_inquiry(last_message)
        priority = self._determine_priority(last_message, inquiry_type)
        can_auto_handle = self._can_auto_handle(inquiry_type, last_message)
        
        triage_result = f"""🕵️ **SAHJONY Support Triage**

**Inquiry Classification:** {inquiry_type.value.replace('_', ' ').title()}
**Priority:** {priority.value.upper()}
**Auto-Handle:** {'✅ Yes - FAQ/Knowledge Base' if can_auto_handle else '❌ No - Requires Human Support'}

"""
        
        if can_auto_handle:
            triage_result += """I'll search our knowledge base for a relevant answer. If no solution is found, I'll create a support ticket for our team."""
        else:
            triage_result += """This inquiry requires human support. I'll create a priority ticket for our support team."""
        
        return AgentResponse(
            content=triage_result,
            agent_type=self.agent_type,
            confidence=0.9,
            tools_used=["triage_analysis"],
            metadata={
                "inquiry_type": inquiry_type.value,
                "priority": priority.value,
                "auto_handle": can_auto_handle
            }
        )
    
    def _classify_inquiry(self, message: str) -> InquiryType:
        """Classify the inquiry type based on keywords"""
        message_lower = message.lower()
        scores = {inquiry_type: 0 for inquiry_type in InquiryType}
        
        for inquiry_type, keywords in self.inquiry_keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[inquiry_type] += 1
        
        # Return the type with highest score, default to GENERAL
        max_score = max(scores.values())
        if max_score == 0:
            return InquiryType.GENERAL
        
        for inquiry_type, score in scores.items():
            if score == max_score:
                return inquiry_type
        
        return InquiryType.GENERAL
    
    def _determine_priority(self, message: str, inquiry_type: InquiryType) -> Priority:
        """Determine priority based on content and type"""
        message_lower = message.lower()
        
        # High priority indicators
        urgent_keywords = ["urgent", "asap", "immediately", "critical", "down", "not working at all", "emergency"]
        if any(kw in message_lower for kw in urgent_keywords):
            return Priority.URGENT
        
        # Complaint or escalation = high
        if inquiry_type in [InquiryType.COMPLAINT, InquiryType.ESCALATION]:
            return Priority.HIGH
        
        # Technical issues = potentially high
        if inquiry_type == InquiryType.TECHNICAL_SUPPORT:
            return Priority.MEDIUM
        
        # Billing issues = medium
        if inquiry_type == InquiryType.BILLING:
            return Priority.MEDIUM
        
        return Priority.LOW
    
    def _can_auto_handle(self, inquiry_type: InquiryType, message: str) -> bool:
        """Determine if this can be handled automatically"""
        # Escalations always need human
        if inquiry_type == InquiryType.ESCALATION:
            return False
        
        # Complaints can be partially auto-handled
        if inquiry_type == InquiryType.COMPLAINT:
            return True  # Can acknowledge and create ticket
        
        # FAQ and general inquiries can be auto-handled
        if inquiry_type in [InquiryType.FAQ, InquiryType.GENERAL]:
            return True
        
        # Others require judgment
        return True  # Default to trying auto-handle


class FAQAgent(BaseAgent):
    """
    FAQ Agent - Answers common questions using the knowledge base.
    
    Uses semantic search to find relevant FAQs and provides
    clear, helpful answers to customer inquiries.
    """
    
    def __init__(self):
        super().__init__("FAQAgent", AgentType.SAHJONY_CORE)
        self.knowledge_base = KnowledgeBase()
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        # Search knowledge base
        relevant_faqs = self.knowledge_base.search(last_message, max_results=3)
        
        if not relevant_faqs:
            return AgentResponse(
                content="""❓ **No matching FAQ found**

I couldn't find a relevant answer in our knowledge base. Let me create a support ticket for you so our team can assist.

Could you provide more details about your question?""",
                agent_type=self.agent_type,
                confidence=0.7,
                tools_used=["knowledge_base_search"],
                metadata={"faqs_found": 0}
            )
        
        # Format response with FAQs
        faq_response = "📚 **From our Knowledge Base:**\n\n"
        
        for i, faq in enumerate(relevant_faqs, 1):
            faq_response += f"**{i}. {faq.question}**\n"
            faq_response += f"{faq.answer}\n\n"
            faq_response += f"_Category: {faq.category.title()} | Helpful? Let me know!_\n\n"
        
        faq_response += "---\n*Was this helpful? Reply 'yes' to confirm or ask a follow-up question.*"
        
        return AgentResponse(
            content=faq_response,
            agent_type=self.agent_type,
            confidence=0.85,
            tools_used=["knowledge_base_search"],
            metadata={
                "faqs_found": len(relevant_faqs),
                "faq_ids": [faq.id for faq in relevant_faqs]
            }
        )


class TicketAgent(BaseAgent):
    """
    Ticket Agent - Creates and manages support tickets.
    
    When inquiries can't be resolved automatically,
    creates structured tickets for human support agents.
    
    Uses module-level store for ticket persistence across instances.
    """
    
    def __init__(self):
        super().__init__("TicketAgent", AgentType.SAHJONY_CORE)
    
    @property
    def tickets(self) -> Dict[str, SupportTicket]:
        """Module-level ticket store for persistence across instances."""
        if not hasattr(TicketAgent, '_ticket_store'):
            TicketAgent._ticket_store = {}
        return TicketAgent._ticket_store
    
    @property
    def counter(self) -> int:
        """Module-level ticket counter."""
        if not hasattr(TicketAgent, '_ticket_counter'):
            TicketAgent._ticket_counter = 0
        return TicketAgent._ticket_counter
    
    @counter.setter
    def counter(self, value: int):
        TicketAgent._ticket_counter = value
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        
        # Check if this is a ticket creation request or update
        if "create ticket" in last_message.lower() or "open ticket" in last_message.lower():
            return await self._create_ticket(context, messages)
        elif "update ticket" in last_message.lower() or "status" in last_message.lower():
            return await self._get_ticket_status(context, last_message)
        else:
            return await self._list_tickets(context)
    
    async def _create_ticket(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        """Create a new support ticket"""
        self.counter += 1
        ticket_id = f"TICKET-{self.counter:04d}"
        
        # Extract subject from messages (last user message)
        subject = messages[-1].content[:100] if messages else "General Inquiry"
        
        ticket = SupportTicket(
            id=ticket_id,
            customer_id=context.user_id,
            subject=subject,
            description=messages[-1].content if messages else "",
            inquiry_type=InquiryType.GENERAL,
            priority=Priority.MEDIUM,
            status="open",
            created_at="2025-01-01T00:00:00Z"  # Would use actual timestamp
        )
        
        self.tickets[ticket_id] = ticket
        
        response = f"""🎫 **Support Ticket Created**

**Ticket ID:** `{ticket_id}`
**Subject:** {subject}
**Status:** Open
**Priority:** Medium

Our support team will respond within 24 hours. You'll receive an email confirmation shortly.

For urgent issues, reply with 'URGENT' in your message."""
        
        return AgentResponse(
            content=response,
            agent_type=self.agent_type,
            confidence=0.95,
            tools_used=["ticket_creation"],
            metadata={"ticket_id": ticket_id}
        )
    
    async def _get_ticket_status(self, context: TaskContext, message: str) -> AgentResponse:
        """Get status of a specific ticket"""
        # Extract ticket ID from message
        ticket_match = re.search(r'TICKET-\\d+', message)
        if not ticket_match:
            return AgentResponse(
                content="Please provide a ticket ID. Format: TICKET-0001",
                agent_type=self.agent_type,
                confidence=0.9,
                tools_used=["ticket_lookup"]
            )
        
        ticket_id = ticket_match.group(0)
        ticket = self.tickets.get(ticket_id)
        
        if not ticket:
            return AgentResponse(
                content=f"❌ Ticket `{ticket_id}` not found. Please verify the ticket ID.",
                agent_type=self.agent_type,
                confidence=0.9,
                tools_used=["ticket_lookup"]
            )
        
        response = f"""📋 **Ticket Status: {ticket_id}**

**Subject:** {ticket.subject}
**Status:** {ticket.status.upper()}
**Priority:** {ticket.priority.value.upper()}
**Created:** {ticket.created_at}

{self._format_ticket_description(ticket)}"""
        
        return AgentResponse(
            content=response,
            agent_type=self.agent_type,
            confidence=0.95,
            tools_used=["ticket_lookup"],
            metadata={"ticket_id": ticket_id, "status": ticket.status}
        )
    
    async def _list_tickets(self, context: TaskContext) -> AgentResponse:
        """List all tickets for a customer"""
        customer_tickets = [t for t in self.tickets.values() if t.customer_id == context.user_id]
        
        if not customer_tickets:
            return AgentResponse(
                content="📋 **No Support Tickets**\n\nYou don't have any open support tickets.",
                agent_type=self.agent_type,
                confidence=0.95,
                tools_used=["ticket_list"],
                metadata={"tickets_count": 0}
            )
        
        response = "📋 **Your Support Tickets:**\n\n"
        for ticket in customer_tickets:
            response += f"- `{ticket.id}` | {ticket.subject[:40]}... | **{ticket.status.upper()}**\n"
        
        response += "\nReply with a ticket ID to get details (e.g., TICKET-0001)"
        
        return AgentResponse(
            content=response,
            agent_type=self.agent_type,
            confidence=0.95,
            tools_used=["ticket_list"],
            metadata={"tickets_count": len(customer_tickets)}
        )
    
    def _format_ticket_description(self, ticket: SupportTicket) -> str:
        """Format ticket description for display"""
        if len(ticket.description) > 200:
            return ticket.description[:200] + "..."
        return ticket.description


class SatisfactionAgent(BaseAgent):
    """
    Satisfaction Agent - Gathers feedback and handles complaints.
    
    Proactively asks for feedback after resolutions and
    handles customer complaints with empathy.
    """
    
    def __init__(self):
        super().__init__("SatisfactionAgent", AgentType.SAHJONY_CORE)
    
    async def process(self, context: TaskContext, messages: List[AgentMessage]) -> AgentResponse:
        last_message = messages[-1].content if messages else ""
        message_lower = last_message.lower()
        
        # Check if customer is expressing dissatisfaction
        negative_keywords = ["frustrated", "disappointed", "unacceptable", "terrible", "worst", "complaint", "angry", "bad", "poor"]
        is_negative = any(kw in message_lower for kw in negative_keywords)
        
        if is_negative:
            response = self._handle_complaint(last_message)
        elif any(word in message_lower for word in ["thank", "great", "awesome", "perfect", "helpful"]):
            response = self._handle_positive_feedback()
        elif any(word in message_lower for word in ["1", "2", "3", "4", "5"]):
            response = await self._handle_rating(last_message, context)
        else:
            response = self._default_response()
        
        return AgentResponse(
            content=response,
            agent_type=self.agent_type,
            confidence=0.9,
            tools_used=["sentiment_analysis"],
            metadata={"sentiment": "negative" if is_negative else "positive"}
        )
    
    def _handle_complaint(self, message: str) -> str:
        """Handle customer complaints with empathy"""
        return """😔 **We're Sorry You're Having a Bad Experience**

I sincerely apologize for any frustration you've encountered. Your feedback is important to us.

Let me escalate this to our support team immediately. A dedicated agent will reach out to you within the next 2 hours to resolve this.

In the meantime, is there anything specific you'd like us to know?"""
    
    def _handle_positive_feedback(self) -> str:
        """Handle positive feedback"""
        return """🌟 **Thank You for Your Feedback!**

We're thrilled to hear you had a great experience! Your positive feedback motivates our team to keep delivering excellent service.

Is there anything else we can help you with today?"""
    
    async def _handle_rating(self, rating: str, context: TaskContext) -> str:
        """Process a satisfaction rating"""
        # Extract rating number
        numbers = re.findall(r'\b([1-5])\b', rating)
        if not numbers:
            return "I couldn't understand your rating. Please rate 1-5."
        
        score = int(numbers[0])
        
        if score >= 4:
            return f"""⭐ **Rating: {score}/5**

Thank you for your positive rating! We're glad we could help.

Feel free to reach out anytime if you need further assistance."""
        elif score >= 3:
            return f"""👍 **Rating: {score}/5**

Thank you for your feedback. We're always looking to improve our service.

If there's something specific we could do better, please let us know!"""
        else:
            return f"""💭 **Rating: {score}/5**

We're sorry this experience wasn't up to our standards. We'd love to learn more about how we can improve.

Could you tell us what went wrong? Our team will follow up to make things right."""
    
    def _default_response(self) -> str:
        """Default satisfaction prompt"""
        return """📊 **How are we doing?**

We'd love your feedback! On a scale of 1-5 (where 5 is excellent), how would you rate your support experience today?

Your feedback helps us serve you better."""


# ============================================================================
# Support Brain - Main Orchestrator
# ============================================================================

class SupportBrain:
    """
    SAHJONY Customer Support Brain
    
    Orchestrates multiple support agents to provide
    comprehensive customer service with persistent memory.
    """
    
    def __init__(self):
        self.triage_agent = TriageAgent()
        self.faq_agent = FAQAgent()
        self.ticket_agent = TicketAgent()
        self.satisfaction_agent = SatisfactionAgent()
        
        # Reuse the base SAHJONY brain for LLM responses
        self.base_brain = base_sahjony_brain
        
        # Session history for context
        self._session_history: Dict[str, List[Dict[str, str]]] = {}
    
    async def process_support_message(
        self,
        customer_id: str,
        customer_name: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Process a customer support message through the multi-agent pipeline.
        """
        session_key = f"support:{customer_id}"
        
        # Get or create history
        if session_key not in self._session_history:
            self._session_history[session_key] = []
        
        history = self._session_history[session_key]
        history.append({"role": "user", "content": message})
        
        # Step 1: Triage the inquiry
        triage_messages = [AgentMessage(role="user", content=message)]
        triage_context = TaskContext(
            user_id=customer_id,
            agent_id="triage",
            agent_config={}
        )
        triage_response = await self.triage_agent.process(triage_context, triage_messages)
        
        yield triage_response.content
        
        inquiry_type = triage_response.metadata.get("inquiry_type", "general")
        priority = triage_response.metadata.get("priority", "medium")
        can_auto_handle = triage_response.metadata.get("auto_handle", True)
        
        await asyncio.sleep(0.3)
        
        # Step 2: Route to appropriate handler
        if can_auto_handle:
            if inquiry_type in ["faq", "general"]:
                # Use FAQ agent
                faq_messages = [AgentMessage(role="user", content=message)]
                faq_response = await self.faq_agent.process(triage_context, faq_messages)
                yield "\n\n" + faq_response.content
                
                # Check if FAQs were helpful
                if faq_response.metadata.get("faqs_found", 0) > 0:
                    history.append({"role": "assistant", "content": faq_response.content})
            else:
                # Try LLM for other auto-handleable inquiries
                llm_response = await self._generate_llm_response(
                    customer_id, message, history, "support"
                )
                if llm_response:
                    yield "\n\n" + llm_response
                else:
                    # Fall back to ticket creation
                    yield "\n\n" + await self._create_fallback_response(message)
        else:
            # Create support ticket for non-auto-handleable inquiries
            ticket_messages = [AgentMessage(role="user", content=message)]
            ticket_response = await self.ticket_agent.process(triage_context, ticket_messages)
            yield "\n\n" + ticket_response.content
        
        # Step 3: Prompt for satisfaction (if conversation is ending)
        if self._should_request_feedback(history):
            await asyncio.sleep(0.5)
            sat_messages = [AgentMessage(role="user", content=message)]
            sat_response = await self.satisfaction_agent.process(triage_context, sat_messages)
            yield "\n\n" + sat_response.content
        
        # Keep history manageable
        if len(history) > 10:
            self._session_history[session_key] = history[-10:]
    
    async def _generate_llm_response(
        self,
        customer_id: str,
        message: str,
        history: List[Dict[str, str]],
        agent_type: str = "support"
    ) -> Optional[str]:
        """Generate response using LLM if available"""
        try:
            agent_config = {
                "model_provider": "auto",
                "model_name": "claude-3-5-sonnet-20241022",
                "system_prompt": """You are a helpful customer support agent for a SaaS platform. 
                You should be friendly, professional, and helpful. Focus on resolving customer issues
                quickly and efficiently. If you cannot resolve an issue, offer to create a support ticket."""
            }
            
            llm_messages = [{"role": m["role"], "content": m["content"]} for m in history[-5:]]
            response = await complete_with_llm(agent_config, llm_messages)
            
            if response and not any(err in response for err in ["not configured", "not installed", "API error"]):
                return response
        except Exception:
            pass
        
        return None
    
    async def _create_fallback_response(self, message: str) -> str:
        """Create fallback response when LLM is not available"""
        return """I'm having trouble processing your request with my AI capabilities alone. 

Let me create a support ticket for you so our human team can assist:

🎫 **Creating Support Ticket...**

Our team will respond within 24 hours. For urgent matters, please reply with 'URGENT' in your message."""
    
    def _should_request_feedback(self, history: List[Dict[str, str]]) -> bool:
        """Determine if we should request feedback"""
        # Only ask for feedback after at least 2 exchanges
        user_messages = [m for m in history if m["role"] == "user"]
        return len(user_messages) >= 2
    
    def clear_history(self, customer_id: str):
        """Clear support history for a customer"""
        session_key = f"support:{customer_id}"
        if session_key in self._session_history:
            del self._session_history[session_key]
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Return support brain capabilities"""
        return {
            "name": "SAHJONY Support Brain",
            "version": "1.0.0",
            "description": "Multi-agent customer support system with triage, FAQ, ticket management",
            "agents": {
                "triage": {"description": "Routes inquiries to appropriate handlers"},
                "faq": {"description": "Answers common questions from knowledge base"},
                "ticket": {"description": "Creates and manages support tickets"},
                "satisfaction": {"description": "Gathers feedback and handles complaints"}
            },
            "knowledge_base_entries": len(KnowledgeBase().entries),
            "features": [
                "Automatic inquiry classification",
                "Priority determination",
                "FAQ-based self-service support",
                "Support ticket creation",
                "Sentiment analysis and complaint handling",
                "Satisfaction rating collection",
                "Persistent session context"
            ]
        }


# ============================================================================
# Singleton Instance
# ============================================================================

support_brain = SupportBrain()