FROM node:18-alpine
WORKDIR /app
COPY server.js .
COPY public/ public/
EXPOSE 3914
CMD ["node","server.js"]
