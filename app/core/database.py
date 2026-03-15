from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# --- Keep your existing engine setup ---
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    db_url,
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,
    pool_recycle=300,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- ADD THIS PART BELOW ---
def get_db():
    """
    Dependency that creates a new SQLAlchemy SessionLocal for each request
    and closes it once the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()