#!/bin/bash

# Setup non interaction for mysql install
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password root"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password root"

# This project is old.. and is not able to use the mysqli extension
# So downgrade php and mysql
sudo apt-get -y purge php*
sudo apt-get -y purge mysql*
sudo apt-get -y autoremove
sudo apt-get -y update
sudo apt-get -y install apache2 \
                        libapache2-mod-php5 \
                        php5 \
                        php5-common \
                        php5-curl \
                        php5-json \
                        php5-mcrypt \
                        php5-memcache \
                        php5-mysql \
                        mysql-server \
                        sendmail

# Enable php mods
sudo php5enmod mcrypt
sudo php5enmod memcache
sudo service apache2 restart

# Setup phpMyAdmin no interaction needed
sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/dbconfig-install boolean true"
sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/app-password-confirm password root"
sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-pass password root"
sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/app-pass password root"
sudo debconf-set-selections <<< "phpmyadmin phpmyadmin/reconfigure-webserver multiselect apache2'"
sudo apt-get -y install phpmyadmin

# Migrate the database
mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS pinup"
mysql -uroot -proot pinup < /var/www/html/sql/schema.sql
mysql -uroot -proot pinup < /var/www/html/sql/seed.sql
