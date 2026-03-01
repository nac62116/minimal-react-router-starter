FROM node:24.14.0 AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24.14.0 AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24.14.0 AS build-env
ARG APP_NAME
ARG BASE_URL
ARG SYSTEM_MAIL_SENDER
ARG MAILER_HOST
ARG MAILER_PORT
ARG MAILER_USER
ARG MAILER_PASS
ARG ALLOW_INDEXING
ARG MATOMO_URL
ARG MATOMO_SITE_ID
ARG SESSION_SECRETS
ARG HONEYPOT_SECRETS
ARG CSRF_SECRETS
ARG MESSAGE_SECRETS
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24.14.0
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]