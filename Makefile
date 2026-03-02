ifneq (,$(wildcard ./.env))
    include .env
endif

.DEFAULT_GOAL := help

help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup-project-dev-on-mac: install-dev-packages-brew setup-project-dev ## Description see make help -> setup-project-dev

setup-project-dev-on-linux: install-dev-packages-apt setup-project-dev ## Description see make help -> setup-project-dev

setup-project-dev: create-dev-certs nginx-conf fresh-packages-and-clean-build react-router-typegen create-docker-network mailer-start ## Before executing make sure to setup your .env! You can simply copy .env.example for local development. --- Setup the project for development. This includes generating self-signed certs for HTTPS in development, generating nginx config from template, installing npm packages and starting MailPit for email testing. The app needs to be started afterwards with either "npm run dev", or with "npm run docker:build" and "npm run docker:start". Afterwards the app is either reachable at https://locahost:3000 (npm run dev) or at https://localhost (docker setup).

setup-project-prod: install-prod-packages-apt setup-certbot-with-autorenewal nginx-conf fresh-packages-and-clean-build create-docker-network ## Before executing make sure to setup your .env and point your domain to this server (f.e. DNS A Record)! --- Setup the project for production. This includes setting up certbot with nginx plugin and auto-renewal for real SSL certificates, generating nginx config from template, and installing npm packages. The app needs to be started with "npm run docker:build" and "npm run docker:start". Afterwards the app is reachable at the DOMAIN and BASE_URL specified in .env.

install-dev-packages-apt: ## Install necessary apt packages for development setup. This includes openssl, curl, node and docker.
	@sudo apt update
	sudo apt install openssl curl
	$(MAKE) install-nvm

install-dev-packages-brew: ## Install necessary homebrew packages for development setup. This includes openssl, curl, node and docker.
	@brew update
	brew install openssl curl
	$(MAKE) install-nvm

install-nvm:
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
	. $$HOME/.nvm/nvm.sh && nvm install ${NODE_VERSION} && nvm use ${NODE_VERSION}

install-prod-packages-apt: ## Install necessary apt packages for production setup. This includes openssl and curl.
	@sudo apt update
	sudo apt install certbot python3-certbot-nginx

create-dev-certs: ## Create self-signed development certificates (for HTTPS in development, to test docker setup locally). Note that browsers will show a warning when using self-signed certificates, which is expected. You can usually click "Advanced" and then "Proceed to localhost (unsafe)" to bypass the warning when testing locally.
	@mkdir -p ./nginx/dev/ssl
	@mkdir -p ./nginx/dev/ssl/live
	@mkdir -p ./nginx/dev/ssl/live/localhost
	openssl req -x509 -newkey rsa:2048 -keyout ./nginx/dev/ssl/live/localhost/privkey.pem -out ./nginx/dev/ssl/live/localhost/fullchain.pem -days 365 -nodes -subj "/CN=localhost"
	openssl dhparam -out ./nginx/dev/ssl/ssl-dhparams.pem 2048
	curl -o ./nginx/dev/ssl/options-ssl-nginx.conf https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf
	curl -o ./nginx/dev/ssl/LICENSE.txt https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/LICENSE.txt

setup-certbot-with-autorenewal: ## Make sure to add a correct A record for your domain before you run this. This sets up certbot with nginx plugin and auto-renewal (for production, to get real certificates).
	sudo certbot certonly --nginx -d ${DOMAIN} --agree-tos --no-eff-email -m ${CERTBOT_UPDATES_RECEIVER}

nginx-conf: ## Generate nginx/default.conf from template using envsubst and .env DOMAIN
	@export DOMAIN=$$(grep '^DOMAIN=' .env | head -n1 | sed 's/#.*//' | cut -d '=' -f2- | tr -d '\"' | xargs) && envsubst '$$DOMAIN' < ./nginx/default.conf.template > ./nginx/default.conf

fresh-packages-and-clean-build: ## Cleanup node_modules and build directories
	@rm -rf ./build
	@rm -rf ./node_modules
	@rm -rf package-lock.json
	@npm cache clean --force
	npm install
	npm run build

react-router-typegen: ## Generate types for react-router routes.
	npm run typegen

create-docker-network: ## Create a docker network for development and production if it doesn't exist. The network is kept external to allow multiple projects to use the same network.
	@docker network inspect react-router-starter-network >/dev/null 2>&1 || docker network create react-router-starter-network

mailer-start: ## MailPit for local development email testing. Access the dashboard at http://localhost:8025 after starting. SMTP Enpoint is localhost:1025
	docker compose -f mailpit/compose.yml up -d

mailer-stop: ## Stop MailPit
	docker compose -f mailpit/compose.yml down