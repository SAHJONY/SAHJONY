"""
Twenty CRM API Client Service

This module provides a client for interacting with Twenty's GraphQL API.
Twenty is an open-source CRM that uses GraphQL for all API operations.

API Documentation: https://docs.twenty.com
GraphQL Endpoint: https://api.twenty.com/graphql
Authentication: Bearer Token (Personal Access Token)
"""

import httpx
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class TwentyConfig(BaseModel):
    """Configuration for Twenty CRM API client"""
    api_url: str = "https://api.twenty.com/graphql"
    api_key: Optional[str] = None
    timeout: int = 30


class TwentyContact(BaseModel):
    """Contact/Person object from Twenty CRM"""
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    job_title: Optional[str] = None


class TwentyCompany(BaseModel):
    """Company object from Twenty CRM"""
    id: str
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    employees: Optional[int] = None


class TwentyOpportunity(BaseModel):
    """Opportunity/Deal object from Twenty CRM"""
    id: str
    name: Optional[str] = None
    amount: Optional[float] = None
    stage: Optional[str] = None
    company_id: Optional[str] = None
    close_date: Optional[str] = None


class TwentyTask(BaseModel):
    """Task object from Twenty CRM"""
    id: str
    title: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    assignee_id: Optional[str] = None


class TwentyClient:
    """
    Client for interacting with Twenty CRM's GraphQL API.
    
    Usage:
        config = TwentyConfig(api_key="your-personal-access-token")
        client = TwentyClient(config)
        
        # Fetch contacts
        contacts = await client.get_contacts(limit=10)
        
        # Create a contact
        new_contact = await client.create_contact({
            "name": "John Doe",
            "email": "john@example.com"
        })
    """
    
    def __init__(self, config: TwentyConfig):
        self.config = config
        self.api_url = config.api_url
        self.api_key = config.api_key
        self.timeout = config.timeout
        
        if not self.api_key:
            logger.warning("Twenty API key not configured. API calls will fail.")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    async def _execute_graphql(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query against the Twenty API.
        
        Args:
            query: GraphQL query string
            variables: Optional variables for the query
            
        Returns:
            Dict containing the API response
        """
        if not self.api_key:
            raise ValueError("Twenty API key is not configured")
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                self.api_url,
                json={"query": query, "variables": variables},
                headers=self._get_headers()
            )
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                logger.error(f"Twenty API GraphQL errors: {result['errors']}")
                raise Exception(f"GraphQL error: {result['errors']}")
            
            return result.get("data", {})
    
    async def health_check(self) -> bool:
        """
        Check if the Twenty API is accessible and authenticated.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            query = """
            query {
                people(first: 1) {
                    nodes {
                        id
                    }
                }
            }
            """
            await self._execute_graphql(query)
            return True
        except Exception as e:
            logger.error(f"Twenty API health check failed: {e}")
            return False
    
    # ============ CONTACTS (PEOPLE) ============
    
    async def get_contacts(self, first: int = 10, after: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch contacts/people from Twenty CRM.
        
        Args:
            first: Number of contacts to fetch (default 10, max 100)
            after: Cursor for pagination
            
        Returns:
            Dict with 'nodes' (list of contacts) and 'pageInfo' (pagination info)
        """
        query = """
        query GetPeople($first: Int, $after: String) {
            people(first: $first, after: $after) {
                nodes {
                    id
                    name
                    email
                    phone
                    jobTitle
                    company {
                        id
                        name
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """
        variables = {"first": min(first, 100), "after": after}
        return await self._execute_graphql(query, variables)
    
    async def get_contact(self, contact_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single contact by ID.
        
        Args:
            contact_id: The contact's ID
            
        Returns:
            Contact data or None if not found
        """
        query = """
        query GetPerson($id: ID!) {
            person(id: $id) {
                id
                name
                email
                phone
                jobTitle
                createdAt
                company {
                    id
                    name
                    domain
                    industry
                }
            }
        }
        """
        data = await self._execute_graphql(query, {"id": contact_id})
        return data.get("person")
    
    async def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new contact/person in Twenty CRM.
        
        Args:
            contact_data: Dict with contact fields (name, email, phone, etc.)
            
        Returns:
            Created contact data
        """
        mutation = """
        mutation CreatePerson($data: PersonCreateInput!) {
            createPerson(data: $data) {
                id
                name
                email
                phone
            }
        }
        """
        return await self._execute_graphql(mutation, {"data": contact_data})
    
    async def update_contact(self, contact_id: str, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing contact.
        
        Args:
            contact_id: ID of the contact to update
            contact_data: Dict with fields to update
            
        Returns:
            Updated contact data
        """
        mutation = """
        mutation UpdatePerson($id: ID!, $data: PersonUpdateInput!) {
            updatePerson(id: $id, data: $data) {
                id
                name
                email
            }
        }
        """
        return await self._execute_graphql(mutation, {"id": contact_id, "data": contact_data})
    
    # ============ COMPANIES ============
    
    async def get_companies(self, first: int = 10, after: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch companies from Twenty CRM.
        
        Args:
            first: Number of companies to fetch (default 10, max 100)
            after: Cursor for pagination
            
        Returns:
            Dict with 'nodes' (list of companies) and 'pageInfo' (pagination info)
        """
        query = """
        query GetCompanies($first: Int, $after: String) {
            companies(first: $first, after: $after) {
                nodes {
                    id
                    name
                    domain
                    industry
                    employees
                    createdAt
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """
        variables = {"first": min(first, 100), "after": after}
        return await self._execute_graphql(query, variables)
    
    async def get_company(self, company_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single company by ID.
        """
        query = """
        query GetCompany($id: ID!) {
            company(id: $id) {
                id
                name
                domain
                industry
                employees
                createdAt
            }
        }
        """
        data = await self._execute_graphql(query, {"id": company_id})
        return data.get("company")
    
    async def create_company(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new company in Twenty CRM.
        
        Args:
            company_data: Dict with company fields (name, domain, industry, etc.)
            
        Returns:
            Created company data
        """
        mutation = """
        mutation CreateCompany($data: CompanyCreateInput!) {
            createCompany(data: $data) {
                id
                name
                domain
            }
        }
        """
        return await self._execute_graphql(mutation, {"data": company_data})
    
    # ============ OPPORTUNITIES (DEALS) ============
    
    async def get_opportunities(self, first: int = 10, after: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch opportunities/deals from Twenty CRM.
        
        Args:
            first: Number of opportunities to fetch (default 10, max 100)
            after: Cursor for pagination
            
        Returns:
            Dict with 'nodes' (list of opportunities) and 'pageInfo' (pagination info)
        """
        query = """
        query GetOpportunities($first: Int, $after: String) {
            opportunities(first: $first, after: $after) {
                nodes {
                    id
                    name
                    amount
                    stage
                    closeDate
                    company {
                        id
                        name
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """
        variables = {"first": min(first, 100), "after": after}
        return await self._execute_graphql(query, variables)
    
    async def get_opportunity(self, opportunity_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single opportunity by ID.
        """
        query = """
        query GetOpportunity($id: ID!) {
            opportunity(id: $id) {
                id
                name
                amount
                stage
                closeDate
                createdAt
                company {
                    id
                    name
                }
            }
        }
        """
        data = await self._execute_graphql(query, {"id": opportunity_id})
        return data.get("opportunity")
    
    async def create_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new opportunity/deal in Twenty CRM.
        
        Args:
            opportunity_data: Dict with opportunity fields (name, amount, stage, etc.)
            
        Returns:
            Created opportunity data
        """
        mutation = """
        mutation CreateOpportunity($data: OpportunityCreateInput!) {
            createOpportunity(data: $data) {
                id
                name
                amount
                stage
            }
        }
        """
        return await self._execute_graphql(mutation, {"data": opportunity_data})
    
    async def update_opportunity(self, opportunity_id: str, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing opportunity.
        """
        mutation = """
        mutation UpdateOpportunity($id: ID!, $data: OpportunityUpdateInput!) {
            updateOpportunity(id: $id, data: $data) {
                id
                name
                amount
                stage
            }
        }
        """
        return await self._execute_graphql(mutation, {"id": opportunity_id, "data": opportunity_data})
    
    # ============ TASKS ============
    
    async def get_tasks(self, first: int = 10, after: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch tasks from Twenty CRM.
        
        Args:
            first: Number of tasks to fetch (default 10, max 100)
            after: Cursor for pagination
            
        Returns:
            Dict with 'nodes' (list of tasks) and 'pageInfo' (pagination info)
        """
        query = """
        query GetTasks($first: Int, $after: String) {
            tasks(first: $first, after: $after) {
                nodes {
                    id
                    title
                    status
                    dueDate
                    assignee {
                        id
                        name
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """
        variables = {"first": min(first, 100), "after": after}
        return await self._execute_graphql(query, variables)
    
    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single task by ID.
        """
        query = """
        query GetTask($id: ID!) {
            task(id: $id) {
                id
                title
                status
                dueDate
                createdAt
                assignee {
                    id
                    name
                }
            }
        }
        """
        data = await self._execute_graphql(query, {"id": task_id})
        return data.get("task")
    
    async def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new task in Twenty CRM.
        
        Args:
            task_data: Dict with task fields (title, status, dueDate, etc.)
            
        Returns:
            Created task data
        """
        mutation = """
        mutation CreateTask($data: TaskCreateInput!) {
            createTask(data: $data) {
                id
                title
                status
            }
        }
        """
        return await self._execute_graphql(mutation, {"data": task_data})
    
    async def update_task(self, task_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing task.
        """
        mutation = """
        mutation UpdateTask($id: ID!, $data: TaskUpdateInput!) {
            updateTask(id: $id, data: $data) {
                id
                title
                status
            }
        }
        """
        return await self._execute_graphql(mutation, {"id": task_id, "data": task_data})
    
    # ============ SEARCH ============
    
    async def search_all(self, query: str, types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Search across all objects in Twenty CRM.
        
        Args:
            query: Search query string
            types: Optional list of types to search (person, company, opportunity, task)
            
        Returns:
            Dict with search results by type
        """
        search_query = """
        query Search($query: String!) {
            search(query: $query) {
                edges {
                    type
                    object
                }
            }
        }
        """
        return await self._execute_graphql(search_query, {"query": query})


# Singleton instance
_twenty_client: Optional[TwentyClient] = None


def get_twenty_client(api_key: Optional[str] = None, api_url: Optional[str] = None) -> TwentyClient:
    """
    Get or create the Twenty client singleton.
    
    Args:
        api_key: Optional API key override
        api_url: Optional API URL override
        
    Returns:
        Configured TwentyClient instance
    """
    global _twenty_client
    
    if _twenty_client is None:
        config = TwentyConfig(
            api_key=api_key,
            api_url=api_url or "https://api.twenty.com/graphql"
        )
        _twenty_client = TwentyClient(config)
    
    return _twenty_client


def init_twenty_client(api_key: str, api_url: Optional[str] = None) -> TwentyClient:
    """
    Initialize the Twenty client with an API key.
    
    Args:
        api_key: Twenty Personal Access Token
        api_url: Optional custom GraphQL endpoint URL
        
    Returns:
        Configured TwentyClient instance
    """
    global _twenty_client
    
    config = TwentyConfig(
        api_key=api_key,
        api_url=api_url or "https://api.twenty.com/graphql"
    )
    _twenty_client = TwentyClient(config)
    
    logger.info("Twenty CRM client initialized successfully")
    return _twenty_client