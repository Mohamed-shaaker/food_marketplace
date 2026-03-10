from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the database engine with connection-pool hardening.
# pool_pre_ping:  tests each connection before handing it to a request
#                 (avoids "server closed the connection unexpectedly").
# pool_recycle:   replaces connections older than 300 s so Neon / PgBouncer
#                 never sees a stale socket.
# pool_timeout:   raises an error after 10 s instead of hanging forever
#                 when the pool is exhausted.
# connect_timeout: gives up on a new TCP connection after 5 s (Neon cold-start
#                  protection).
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,
    pool_recycle=300,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)