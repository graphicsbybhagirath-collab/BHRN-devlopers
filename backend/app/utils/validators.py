import re
from datetime import datetime

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
TIME_REGEX = r'^(?:[01]\d|2[0-3]):[0-5]\d$'

def is_valid_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(EMAIL_REGEX, email.strip()))

def parse_date(date_str: str):
    if not date_str or not isinstance(date_str, str):
        return None
    try:
        return datetime.strptime(date_str.strip(), '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None

def is_valid_date_range(start_date_str: str, end_date_str: str) -> bool:
    if not start_date_str or not end_date_str:
        return True
    s_date = parse_date(start_date_str)
    e_date = parse_date(end_date_str)
    if not s_date or not e_date:
        return False
    return s_date <= e_date

def is_valid_time(time_str: str) -> bool:
    if not time_str or not isinstance(time_str, str):
        return False
    return bool(re.match(TIME_REGEX, time_str.strip()))

def parse_positive_float(val):
    if val is None:
        return None
    try:
        num = float(val)
        if num <= 0 or num != num or num == float('inf') or num == float('-inf'):
            return None
        return round(num, 2)
    except (ValueError, TypeError):
        return None
