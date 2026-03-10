FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Cloud Run expects a PORT environment variable
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
