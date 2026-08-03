FROM serversideup/php:8.2-cli AS build

WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist

COPY . .
RUN composer dump-autoload --optimize

FROM serversideup/php:8.2-web

# Environment settings for production
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

# Copy built app
COPY --from=build /var/www/html /var/www/html

# Run migrations and cache configs on startup
# ServersideUp images support initialization scripts in /etc/s6-overlay/s6-rc.d/
USER root
RUN echo -e "#!/bin/sh\nphp artisan optimize:clear\nphp artisan optimize\nphp artisan migrate --force" > /etc/s6-overlay/s6-rc.d/init-laravel-app/run && \
    chmod +x /etc/s6-overlay/s6-rc.d/init-laravel-app/run

USER www-data
