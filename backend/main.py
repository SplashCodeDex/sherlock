"""
Sherlock Security Center - FastAPI Backend
=========================================

A comprehensive security scanning platform with real-time monitoring,
threat intelligence, and automated reporting capabilities.

Features:
- RESTful API for security operations
- WebSocket support for real-time scanning updates
- JWT-based authentication and RBAC
- PostgreSQL database with SQLAlchemy ORM
- Redis caching and rate limiting
- Celery for background task processing
- Comprehensive logging and monitoring
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
import sys
from pathlib import Path

# Database imports
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# Authentication imports
from passlib.context import CryptContext
from jose import JWTError, jwt

# Redis imports
import redis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_center.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Sherlock integration
try:
    from sherlock_project.sherlock import sherlock, SherlockFuturesSession
    from sherlock_project.result import QueryStatus
    from sherlock_project.sites import SitesInformation
    from sherlock_project.notify import QueryNotify
    SHERLOCK_AVAILABLE = True
    print("Sherlock module loaded successfully.")
except ImportError as e:
    print(f"Sherlock module not available. Running in demo mode. Error: {e}")
    SHERLOCK_AVAILABLE = False


# Settings
class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./security_center.db"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Security
    allowed_hosts: str = "localhost,127.0.0.1"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 900  # 15 minutes

    # Sherlock
    sherlock_timeout: int = 30
    max_concurrent_scans: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in env file

    @property
    def allowed_hosts_list(self) -> List[str]:
        return [host.strip() for host in self.allowed_hosts.split(",")]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()

# Database setup - Use SQLite for development/demo
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis client
redis_client = redis.from_url(settings.redis_url)

# FastAPI app
app = FastAPI(
    title="Sherlock Security Center API",
    description="Comprehensive security scanning platform with real-time monitoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts_list)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security schemes
security = HTTPBearer()

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    scans = relationship("Scan", back_populates="user")
    scheduled_scans = relationship("ScheduledScan", back_populates="user")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheduled_scan_id = Column(Integer, ForeignKey("scheduled_scans.id"), nullable=True)
    target_url = Column(String, index=True)
    scan_type = Column(String)
    status = Column(String, default="pending")
    security_score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    findings = Column(Text, nullable=True)  # JSON string

    # Relationships
    user = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan")
    scheduled_scan = relationship("ScheduledScan", back_populates="scans")


class ScheduledScan(Base):
    __tablename__ = "scheduled_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String, index=True)
    frequency = Column(String)  # e.g., "daily", "weekly", "monthly"
    next_scan_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scheduled_scans")
    scans = relationship("Scan", back_populates="scheduled_scan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_url = Column(String, index=True)
    scan_type = Column(String)
    status = Column(String, default="pending")
    security_score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    findings = Column(Text, nullable=True)  # JSON string

    # Relationships
    user = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan")

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    site_name = Column(String)
    url_main = Column(String)
    url_user = Column(String)
    status = Column(String)
    http_status = Column(Integer, nullable=True)
    query_time = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    scan = relationship("Scan", back_populates="results")

# Pydantic Models
class ScanType(str, Enum):
    QUICK = "quick"
    COMPREHENSIVE = "comprehensive"
    API = "api"
    COMPLIANCE = "compliance"

class ScanRequest(BaseModel):
    target_url: str = Field(..., description="URL to scan for username presence")
    scan_type: ScanType = Field(default=ScanType.COMPREHENSIVE, description="Type of security scan")

    @validator('target_url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class ScanResponse(BaseModel):
    scan_id: int
    status: str
    message: str

class ScanStatus(BaseModel):
    scan_id: int
    status: str
    progress: float
    security_score: Optional[float]
    findings_count: int
    started_at: datetime
    completed_at: Optional[datetime]

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Rate limiting
def check_rate_limit(user_id: int) -> bool:
    """Check if user has exceeded rate limit"""
    key = f"rate_limit:{user_id}"
    current = redis_client.get(key)

    if current and int(current) >= settings.rate_limit_requests:
        return False

    # Increment counter
    redis_client.incr(key)
    redis_client.expire(key, settings.rate_limit_window)
    return True

# Sherlock scanning functions
class WebSocketQueryNotify(QueryNotify):
    def __init__(self, scan_id, manager, total_sites, db):
        super().__init__()
        self.scan_id = scan_id
        self.manager = manager
        self.total_sites = total_sites
        self.scanned_sites = 0
        self.db = db

    def start(self, username):
        # You can optionally send a message when the scan starts
        pass

    def update(self, result):
        self.scanned_sites += 1
        progress = (self.scanned_sites / self.total_sites) * 100

        # Save result to database
        scan_result = ScanResult(
            scan_id=self.scan_id,
            site_name=result.site_name,
            url_main=result.site_url_main,
            url_user=result.site_url_user,
            status=str(result.status),
            http_status=result.http_status,
            query_time=result.query_time,
            error_message=result.context
        )
        self.db.add(scan_result)
        self.db.commit()

        # Broadcast progress
        asyncio.run(self.manager.broadcast(json.dumps({
            "type": "scan_progress",
            "scan_id": self.scan_id,
            "progress": progress,
            "current_site": result.site_name,
            "status": str(result.status)
        })))

    def finish(self):
        # You can optionally send a message when the scan finishes
        pass

async def perform_security_scan(scan_id: int, target_url: str, scan_type: str, db: Session):
    """Perform security scan using Sherlock"""
    if not SHERLOCK_AVAILABLE:
        logger.error("Sherlock module not available. Cannot perform scan.")
        # Update scan status to failed
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        scan.status = "failed"
        scan.completed_at = datetime.utcnow()
        db.commit()
        await manager.broadcast(json.dumps({
            "type": "scan_failed",
            "scan_id": scan_id,
            "error": "Sherlock module not available."
        }))
        return

    try:
        # Update scan status
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        scan.status = "running"
        db.commit()

        # Extract username from the URL
        from urllib.parse import urlparse

        def extract_username(url: str) -> str:
            try:
                # Remove query parameters and fragments
                url = url.split('?')[0].split('#')[0]
                
                # Common patterns for usernames in URLs
                # 1. Last part of the path: https://www.instagram.com/username
                # 2. After a specific path segment: https://www.facebook.com/profile.php?id=username
                # This is a simplified approach and might need to be expanded for more complex URLs.
                
                parsed_url = urlparse(url)
                path_segments = parsed_url.path.strip('/').split('/')
                
                if len(path_segments) > 0:
                    # Check for common social media path structures
                    if path_segments[0] in ['user', 'users', 'u']:
                        if len(path_segments) > 1:
                            return path_segments[1]
                    
                    # For many sites, the username is the first path segment
                    return path_segments[0]

            except Exception:
                pass
            
            # Fallback for simple cases
            return url.split('/')[-1] if '/' in url else url

        username = extract_username(target_url)

        # Initialize Sherlock
        sites = SitesInformation()
        site_data = {site.name: site.information for site in sites}
        total_sites = len(site_data)

        # Create a custom notifier to send updates over WebSocket
        query_notify = WebSocketQueryNotify(scan_id, manager, total_sites, db)

        # Perform scan
        results = sherlock(
            username,
            site_data,
            query_notify,
            timeout=settings.sherlock_timeout
        )

        # Calculate security score
        claimed_count = sum(1 for r in results.values() if r["status"].status == QueryStatus.CLAIMED)
        total_count = len(results)
        security_score = 100 - (claimed_count / total_count * 100) if total_count > 0 else 100

        # Update scan with results
        scan.status = "completed"
        scan.completed_at = datetime.utcnow()
        scan.security_score = security_score
        scan.findings = json.dumps({k: {"url_user": v["url_user"], "status": str(v["status"].status)} for k, v in results.items()})
        db.commit()

        # Send completion notification
        await manager.broadcast(json.dumps({
            "type": "scan_completed",
            "scan_id": scan_id,
            "security_score": security_score,
            "findings_count": len(results)
        }))

    except Exception as e:
        logger.error(f"Scan {scan_id} failed: {str(e)}")
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        scan.status = "failed"
        scan.completed_at = datetime.utcnow()
        db.commit()

        await manager.broadcast(json.dumps({
            "type": "scan_failed",
            "scan_id": scan_id,
            "error": str(e)
        }))

# API Routes
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/scans", response_model=ScanResponse)
async def create_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create and start a new security scan"""
    # Check rate limit
    if not check_rate_limit(current_user.id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # Create scan record
    scan = Scan(
        user_id=current_user.id,
        target_url=scan_request.target_url,
        scan_type=scan_request.scan_type.value
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Start background scan
    background_tasks.add_task(
        perform_security_scan,
        scan.id,
        scan_request.target_url,
        scan_request.scan_type.value,
        db
    )

    return ScanResponse(
        scan_id=scan.id,
        status="started",
        message="Security scan initiated successfully"
    )

@app.get("/scans/{scan_id}", response_model=ScanStatus)
async def get_scan_status(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the status of a specific scan"""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    results_count = db.query(ScanResult).filter(ScanResult.scan_id == scan_id).count()

    return ScanStatus(
        scan_id=scan.id,
        status=scan.status,
        progress=100.0 if scan.status == "completed" else 0.0,  # Simplified
        security_score=scan.security_score,
        findings_count=results_count,
        started_at=scan.started_at,
        completed_at=scan.completed_at
    )

@app.get("/scans", response_model=List[ScanStatus])
async def list_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """List user's scans"""
    scans = db.query(Scan).filter(Scan.user_id == current_user.id)\
        .order_by(Scan.started_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()

    result = []
    for scan in scans:
        results_count = db.query(ScanResult).filter(ScanResult.scan_id == scan.id).count()
        result.append(ScanStatus(
            scan_id=scan.id,
            status=scan.status,
            progress=100.0 if scan.status == "completed" else 0.0,
            security_score=scan.security_score,
            findings_count=results_count,
            started_at=scan.started_at,
            completed_at=scan.completed_at
        ))

    return result

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time scan updates"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.send_personal_message(f"Echo: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and perform startup tasks"""
    logger.info("Starting Sherlock Security Center API")

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    # Test Redis connection
    try:
        redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error(f"Redis connection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )