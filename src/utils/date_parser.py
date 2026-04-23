from datetime import date

def parse_german_date(date_str: str) -> date:
    """
    Parses a date string in German format (DD.MM.YYYY) into a date object.

    Args:
        date_str: Date string in DD.MM.YYYY format

    Returns:
        date object

    Raises:
        ValueError: if the date string is invalid
    """
    parts = date_str.strip().split(".")
    if len(parts) != 3:
        raise ValueError("Date string must be in DD.MM.YYYY format")
    return date.fromisoformat("-".join(reversed(parts)))
