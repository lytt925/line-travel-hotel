FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm run build

# production stage
FROM node:20-alpine AS production
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
RUN chown -R nonroot:nonroot /app
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=base /app/dist ./dist
EXPOSE 3000
USER nonroot
CMD ["npm", "run", "start:prod"]