# build
FROM node:20-bullseye AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @rollup/rollup-linux-x64-gnu
COPY . .
RUN npm run build

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# optional: custom nginx.conf for React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
