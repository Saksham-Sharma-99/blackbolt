FROM python:3.11-slim

WORKDIR /app

# Install system deps for pymupdf and rarfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    unrar-free \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Install Python dependencies
COPY pyproject.toml ./
RUN uv pip install --system -e ".[dev]"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
