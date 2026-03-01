ARG NODE_VERSION=24.14.0

FROM node:${NODE_VERSION} AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:${NODE_VERSION} AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:${NODE_VERSION} AS build-env
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

FROM node:${NODE_VERSION}
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY app/lib/mails/templates /app/app/lib/mails/templates
WORKDIR /app
CMD ["npm", "run", "start"]