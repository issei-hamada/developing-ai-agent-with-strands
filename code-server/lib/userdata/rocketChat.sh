#!/bin/bash
apt update
apt install -y snapd
systemctl enable --now snapd.service

sleep 30

snap install rocketchat-server --channel=7.x/stable

systemctl enable snap.rocketchat-server.rocketchat-server.service
systemctl start snap.rocketchat-server.rocketchat-server.service