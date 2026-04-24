# Use the official Python 3.12 slim image
#FROM python:3.12-slim

# Set the working directory inside the container
#WORKDIR /app

# Copy the requirements file first to leverage Docker's cache
#COPY requirements.txt .

# Install the dependencies
#RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files
#COPY . .

# Create a data directory for the SQLite database
#RUN mkdir -p /app/data

# Run the FastAPI server
# We use --host 0.0.0.0 so it's accessible outside the container
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Use the official Python 3.12 slim image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker's cache
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files
COPY . .

# Run the FastAPI server
# This now dynamically binds to Render's $PORT variable, but falls back to 8000 for local development
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]