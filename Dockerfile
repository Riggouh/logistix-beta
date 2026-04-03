FROM node:22-alpine
WORKDIR /app
COPY server.js .
COPY public/ ./public/
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "server.js"]
