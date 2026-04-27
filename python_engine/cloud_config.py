"""
cloud_config.py
Cloud-aware configuration for the Python engine.
Detects whether running locally or in cloud (Railway/Render/AWS)
and adjusts paths and settings accordingly.
"""

import os
import logging

log = logging.getLogger(__name__)

def detect_environment() -> str:
    """Detect current deployment environment."""
    if os.getenv("RAILWAY_ENVIRONMENT"):
        return "railway"
    if os.getenv("RENDER"):
        return "render"
    if os.getenv("AWS_EXECUTION_ENV"):
        return "aws"
    if os.getenv("DYNO"):
        return "heroku"
    if os.getenv("NODE_ENV") == "production":
        return "production"
    return "development"

def get_data_path() -> str:
    """Get data directory path — works in both local and cloud."""
    # Railway/Render mount data at /app/data
    cloud_path = "/app/data"
    local_path = os.path.join(os.path.dirname(__file__), "../data")

    if os.path.exists(cloud_path):
        return cloud_path
    return local_path

CLOUD_ENV     = detect_environment()
IS_PRODUCTION = CLOUD_ENV != "development"
DATA_PATH     = get_data_path()

# Adjust settings for cloud (less memory, faster)
if IS_PRODUCTION:
    MONTE_CARLO_SIMS_CLOUD  = 200   # Reduced from 1000 for cloud speed
    N_INIT_CLOUD            = 20    # Reduced from 50
else:
    MONTE_CARLO_SIMS_CLOUD  = 1000
    N_INIT_CLOUD            = 50

log.info(f"Cloud environment: {CLOUD_ENV} | Production: {IS_PRODUCTION}")
