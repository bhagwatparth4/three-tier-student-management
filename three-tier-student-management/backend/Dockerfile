FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./
COPY models ./models
COPY routes ./routes
COPY middleware ./middleware
COPY utils ./utils
USER appuser
EXPOSE 8080
CMD ["node", "server.js"]
