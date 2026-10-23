# Build backend
FROM node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS backend-builder

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci --workspace umbrel-lnd-backend --omit=dev
# Copy project files and folders
COPY apps/backend ./apps/backend



# Build frontend
FROM node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS frontend-builder

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci --workspace umbrel-lnd-frontend

# Copy project files and folders
COPY apps/frontend ./apps/frontend

# Build assets
RUN npm run build:frontend



# Final image
FROM node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS lightning

# Change directory to '/app' 
WORKDIR /app

# Copy built code from build stages to '/app' directory
COPY --from=backend-builder /app /app
COPY --from=frontend-builder /app/apps/frontend/dist/ /app/apps/frontend/dist/

EXPOSE 3006
CMD [ "npm", "run", "dev:backend" ]
