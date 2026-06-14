# Project lifecycle states — kept in sync across backend and frontend
PROJECT_STATUSES = [
    "draft",
    "analyzing",
    "character_review",
    "producing",
    "scene_review",
    "ready",
    "published",
    "failed",
]

# Supported upload formats
SUPPORTED_FORMATS = {
    "image": [".jpg", ".jpeg", ".png", ".webp"],
    "archive": [".cbz", ".cbr"],
    "document": [".pdf"],
}

# All supported extensions flattened
ALL_SUPPORTED_EXTENSIONS = [
    ext for exts in SUPPORTED_FORMATS.values() for ext in exts
]

# Normalized output format for page images
OUTPUT_IMAGE_FORMAT = "PNG"
