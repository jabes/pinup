#!/bin/bash

# https://github.com/scotch-io/scotch-box/issues/275
sudo rm /etc/apt/sources.list.d/ondrej-php5-5_6-trusty.list
sudo apt-get -y update

# This project is old.. and is not able to use the mysqli extension
# So downgrade to php5.6
sudo apt-get -y purge php.*
sudo apt-get -y install php5.6 php5.6-cli php5.6-common php5.6-curl php5.6-dev php5.6-fpm php5.6-json php5.6-mbstring php5.6-memcache php5.6-mysql libapache2-mod-php5.6 sendmail
sudo apt-get -y autoremove
sudo service apache2 restart

# Migrate the database
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS pinup"
mysql -uroot -proot pinup < /var/www/public/sql/schema.sql
mysql -uroot -proot pinup < /var/www/public/sql/seed.sql

