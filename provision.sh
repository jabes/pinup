#!/bin/bash

# https://github.com/scotch-io/scotch-box/issues/275
sudo rm /etc/apt/sources.list.d/ondrej-php5-5_6-trusty.list
sudo apt-get -y update

# This project is old.. and is not able to use the mysqli extension
# So downgrade to php5.6
sudo apt-get -y purge php.*
sudo apt-get -y install php5.6 \
                        php5.6-common \
                        php5.6-curl \
                        php5.6-json \
                        php5.6-mbstring \
                        php5.6-memcache \
                        php5.6-mysql \
                        libapache2-mod-php5.6 \
                        sendmail
sudo apt-get -y autoremove
sudo service apache2 restart

# Migrate the database
mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS pinup"
mysql -uroot -proot pinup < /var/www/public/sql/schema.sql
mysql -uroot -proot pinup < /var/www/public/sql/seed.sql

# Bind to all available addresses
printf "[mysqld]\nbind-address = 0.0.0.0" | sudo tee /etc/mysql/conf.d/bind_address.cnf
sudo service mysql restart

# Grant privileges to all local ips
mysql -uroot -proot -e "GRANT ALL ON pinup.* TO root@'192.168.1.%' IDENTIFIED BY 'root'"
mysql -uroot -proot -e "GRANT ALL ON pinup.* TO root@'pinup-stats.dev' IDENTIFIED BY 'root'"

# Allow remote connections from local subnet
sudo iptables -A INPUT -i eth0 -s 192.168.1.0/24 -p tcp --destination-port 3306 -j ACCEPT
