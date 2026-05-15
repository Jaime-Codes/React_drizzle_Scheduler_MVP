FROM node:24
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copies the rest of your server files
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
