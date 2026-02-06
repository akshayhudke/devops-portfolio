FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

ARG VITE_API_BASE
ARG VITE_GITHUB_REPO
ARG VITE_GIT_COMMIT
ARG VITE_BUILD_TIME
ARG VITE_BASE_PATH

ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_GITHUB_REPO=$VITE_GITHUB_REPO \
    VITE_GIT_COMMIT=$VITE_GIT_COMMIT \
    VITE_BUILD_TIME=$VITE_BUILD_TIME \
    VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
