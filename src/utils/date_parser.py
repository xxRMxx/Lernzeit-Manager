from datetime import date
from typing import Optional

def parse_german_date(date_str: str) -> Optional[date]:
    """
    Parses a date string in German format (DD.MM.YYYY) into a datetime.date object.
    
    Args:
        date_str: A string in the format "DD.MM.YYYY"
        
    Returns:
        A datetime.date object if successful, or None if the input is invalid.
        
    Raises:
        ValueError: If the date is invalid (e.g., 31.02.2024).
    """
    if not date_str or not date_str.strip():
        return None
        
    try:
        parts = date_str.strip().split(".")
        if len(parts) != 3:
            return None
            
        # date.fromisoformat expects YYYY-MM-DD
        iso_str = f"{parts[2].zfill(4)}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        return date.fromisoformat(iso_str)
    except (ValueError, IndexError):
        return None
