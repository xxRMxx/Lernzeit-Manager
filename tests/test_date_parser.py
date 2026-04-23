from datetime import date
import pytest
from src.utils.date_parser import parse_german_date

def test_parse_valid_german_date():
    result = parse_german_date("01.12.2023")
    assert result == date(2023, 12, 1)

def test_parse_valid_german_date_with_spaces():
    result = parse_german_date("  15.04.2024  ")
    assert result == date(2024, 4, 15)

def test_parse_invalid_german_date_format_raises_error():
    with pytest.raises(ValueError):
        parse_german_date("2023-12-01")  # ISO format, not German

def test_parse_invalid_german_date_non_existent_day_raises_error():
    with pytest.raises(ValueError):
        parse_german_date("32.12.2023")

def test_parse_invalid_german_date_non_existent_month_raises_error():
    with pytest.raises(ValueError):
        parse_german_date("01.13.2023")

def test_parse_invalid_german_date_empty_string_raises_error():
    with pytest.raises(ValueError):
        parse_german_date("")

def test_parse_invalid_german_date_none_raises_error():
    with pytest.raises(AttributeError):
        parse_german_date(None)
