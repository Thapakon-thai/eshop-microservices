FROM node:20-alpine

WORKDIR /app

COPY apps/gateway/package.json .
RUN npm install

COPY apps/gateway/index.js .
COPY packages/proto /app/packages/proto
# COPY apps/gateway/.env . # Optional if env is used

EXPOSE 8000
CMD ["npm", "run", "dev"]
