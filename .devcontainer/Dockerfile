FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Install MongoDB client tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends mongodb-clients

# Clean up
RUN apt-get clean -y && rm -rf /var/lib/apt/lists/*
