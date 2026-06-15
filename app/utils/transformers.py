from datetime import datetime
from typing import Any, Dict

def parse_iso_datetime(iso_str: str) -> datetime:
    """Safely parse ISO datetime strings."""
    if not iso_str:
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
    except ValueError:
        return datetime.utcnow()

def transform_neo_feed(raw_data: Dict[str, Any]) -> list:
    """Transform raw NASA NEO feed items into clean dictionaries."""
    transformed = []
    element_count = raw_data.get("element_count", 0)
    if element_count == 0:
        return transformed

    near_earth_objects = raw_data.get("near_earth_objects", {})
    for date, items in near_earth_objects.items():
        for item in items:
            close_approach = item.get("close_approach_data", [{}])[0]
            transformed.append({
                "neo_reference_id": item.get("neo_reference_id"),
                "name": item.get("name"),
                "nasa_jpl_url": item.get("nasa_jpl_url"),
                "absolute_magnitude_h": item.get("absolute_magnitude_h"),
                "estimated_diameter_km_max": item.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max"),
                "is_potentially_hazardous_asteroid": item.get("is_potentially_hazardous_asteroid", False),
                "close_approach_date": close_approach.get("close_approach_date"),
                "miss_distance_km": close_approach.get("miss_distance", {}).get("kilometers"),
                "relative_velocity_kph": close_approach.get("relative_velocity", {}).get("kilometers_per_hour"),
            })
    return transformed
