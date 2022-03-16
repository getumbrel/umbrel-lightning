# Build backend
FROM node:16-buster-slim AS backend-builder

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/package.json
# The following line should not be required, it makes the builds take longer and the
# resulting docker image contains all the frontend build deps. Once the backend deps
# have all been explicitly declared in apps/backend/package.json it can be removed.
# Currently the backend is implicitly depending on child deps from the frontend package.
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN yarn

# Copy project files and folders
COPY apps/backend ./apps/backend



# Build frontend
FROM node:16-buster-slim AS frontend-builder

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN yarn

# Copy project files and folders
COPY apps/frontend ./apps/frontend

# Build assets
RUN yarn run build:frontend



# Final image
FROM node:16-buster-slim AS lightning

# Change directory to '/app' 
WORKDIR /app

# Copy built code from build stages to '/app' directory
COPY --from=backend-builder /app /app
COPY --from=frontend-builder /app/apps/frontend/dist/ /app/apps/frontend/dist/

EXPOSE 3006
CMD [ "npm", "run", "dev:backend" ]