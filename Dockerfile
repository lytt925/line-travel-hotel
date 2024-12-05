FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=base /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]