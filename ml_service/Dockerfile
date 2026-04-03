# Use official Python slim image for a lightweight footprint
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 5001

# Set the working directory
WORKDIR /app

# Install system dependencies (needed for some ML packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port (Render will override this with the $PORT env var)
EXPOSE 5001

# Start the application using Gunicorn
CMD gunicorn app:app --workers 2 --threads 4 --bind 0.0.0.0:${PORT:-5001} --timeout 60
