FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package dependencies
COPY package.json package-lock.json /app/

# Install dependencies
RUN npm install

# Copy project files
COPY . /app/

# Expose port (Vite default is 5173)
EXPOSE 5173

# Start Vite dev server and bind to 0.0.0.0 (using --host)
CMD ["npm", "run", "dev", "--", "--host"]
