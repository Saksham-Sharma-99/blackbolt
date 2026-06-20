from pydantic import BaseModel


class PageResponse(BaseModel):
    id: str
    page_number: int
    width: int
    height: int
    url: str
    file_size_bytes: int


class PaginatedPagesResponse(BaseModel):
    pages: list[PageResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
