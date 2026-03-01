ifneq (,$(wildcard ./.env))
    include .env
endif

.DEFAULT_GOAL := help

help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

create-dev-certs: ## Create self-signed development certificates (for HTTPS in development, to test docker setup locally). Note that browsers will show a warning when using self-signed certificates, which is expected. You can usually click "Advanced" and then "Proceed to localhost (unsafe)" to bypass the warning when testing locally.
	@mkdir -p ./nginx/dev/ssl
	@mkdir -p ./nginx/dev/ssl/certs
	openssl req -x509 -newkey rsa:2048 -keyout ./nginx/dev/ssl/certs/privkey.pem -out ./nginx/dev/ssl/certs/fullchain.pem -days 365 -nodes -subj "/CN=localhost"
	openssl dhparam -out ./nginx/dev/ssl/certs/ssl-dhparams.pem 2048
	@mkdir -p ./nginx/dev/ssl/certbot-files
	curl -o ./nginx/dev/ssl/certbot-files/options-ssl-nginx.conf https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf
	curl -o ./nginx/dev/ssl/certbot-files/LICENSE.txt https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/LICENSE.txt

setup-certbot-with-autorenewal: ## Make sure to add a correct A record for your domain before you run this. This sets up certbot with nginx plugin and auto-renewal (for production, to get real certificates).
	@sudo apt update
	sudo apt install -y certbot python3-certbot-nginx
	sudo certbot certonly --nginx -d ${DOMAIN} --agree-tos --no-eff-email -m ${CERTBOT_UPDATES_RECEIVER}

fresh-packages-and-clean-build: ## Cleanup node_modules and build directories
	@rm -rf ./build
	@rm -rf ./node_modules
	@npm cache clean --force
	npm install
	npm run build

mailer-start: ## MailPit for local development email testing. Access the dashboard at http://localhost:8025 after starting. SMTP Enpoint is localhost:1025
	docker compose -f mailpit/compose.yml up -d

mailer-stop: ## Stop MailPit
	docker compose -f mailpit/compose.yml down