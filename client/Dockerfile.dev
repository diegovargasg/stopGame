# Specify base image
FROM node:alpine
WORKDIR "/app"

# Install dependencies
COPY ./package.json ./
RUN npm install
COPY . .

# Default command
CMD ["npm", "run", "start"]