import pytest
from datetime import date
from src.utils.date_parser import parse_german_date

def test_parse_valid_german_dates():
    assert parse_german_date("01.01.2024") == date(2024, 1, 1)
    assert parse_german_date("31.12.2023") == date(2023, 12, 31)
    assert parse_german_date("15.05.2022") == date(2022, 5, 15)

def test_parse_leap_year_dates():
    assert parse_german_date("29.02.2024") == date(2024, 2, 29)

def test_parse_invalid_dates_return_none():
    assert parse_german_date("31.02.2024") is None  # Invalid day for month
    assert parse_german_date("32.01.2024") is None  # Invalid day
    assert parse_german_date("01.13.2024") is None  # Invalid month
    assert parse_german_date("00.00.0000") is None  # Invalid zeroes
    assert parse_german_date("29.02.2023") is None  # Not a leap year

def test_parse_invalid_formats_return_none():
    assert parse_german_date("2024-01-01") is None
    assert parse_german_date("01/01/2024") is None

def test_parse_empty_or_whitespace_strings_return_none():
    assert parse_german_date("") is None
    assert parse_german_date("   ") is None
    assert parse_german_date(None) is None

def test_parse_malformed_strings_return_none():
    assert parse_german_date("invalid date") is None
    assert parse_german_date("12.34") is None
    assert parse_german_date("..") is None
    assert parse_german_date("1.2.3.4") is None
