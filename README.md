# React Router Starter

## Install required packages

- You need to install Docker on Ubuntu (https://docs.docker.com/engine/install/ubuntu/) or Docker Desktop (https://www.docker.com/products/docker-desktop/)
- And make to run Makefile recipes (f.e. apt install make)
- Other dependencies are auto installed with the `make setup-project-<dev|prod>` commands. These are:
  - Dev only: openssl via apt or homebrew
  - Dev only: curl via apt or homebrew
  - Dev only: nvm via their install script -> https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh
  - Prod only: certbot via atp
  - Prod only: python3-certbot-nginx via atp

## Setup dev

- Create a .env file in the base directory using .env.example. It is already setup for dev development.
  - `cp ./.env.example ./.env`
- Run the setup-project-dev-on-mac or setup-project-dev-on-linux command via make
  - `make setup-project-dev-on-mac` or `make setup-project-dev-on-linux`

## Start dev

- React Router dev server with HMR and more:
  - `nvm use`
  - `npm run dev`
  - App reachable through http://localhots:3000
- Docker dev for testing production deployment:
  - `npm run docker:build`
  - `npm run docker:start`
  - App reachable via self signed cert on https://localhost
- Remember to rebuild for changes to take effect
- Dev Mailer (Mailpit) is automatically started and reachable on http://localhost:8025

## Setup prod

- Create a .env file in the base directory using .env.example. Changes are needed for prod.
  - `cp ./.env.example ./.env`
- Edit .env file
  - Change the BASE_URL (f.e. https://sub.domain.tld)
  - Change the SSL_DOCKER_MOUNT to `"/etc/letsencrypt:/etc/letsencrypt:ro"`
  - Add an email for CERTBOT_UPDATES_RECEIVER which will inform you about renewal
  - Change the DOMAIN (f.e. sub.domain.tld)
  - Change SYSTEM_MAIL_SENDER, MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASS to fit your actual smtp host or leave it blank if not used (optional)
  - Add matomo via MATOMO_URL and MATOMO_SITE_ID if you want (optional)
  - Generate and add your \_SECRETS
- Run the setup-project-prod command via make
  - `make setup-project-prod`
- Setup github workflow (create deploy key, create appleboy key, setup github secrets) -> TODO: document and automate

## Start prod

- `docker compose build --no-cache`
- `docker compose up -d`
- Remember to rebuild for changes to take effect
