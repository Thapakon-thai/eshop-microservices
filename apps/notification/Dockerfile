FROM node:18-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

# Prune dev dependencies? For now, keep it simple specific to this microservice style
# But usually we want production node_modules
# RUN npm prune --production

CMD ["npm", "start"]
