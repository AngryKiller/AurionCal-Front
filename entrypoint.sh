#!/bin/sh

# Create settings file
echo "window.settings = {" > /app/settings.js
env | grep VITE_ | while read -r line; do
  key=$(echo "$line" | cut -d'=' -f1)
  value=$(echo "$line" | cut -d'=' -f2)
  echo "  $key: '$value'," >> /app/settings.js
done
echo "}" >> /app/settings.js

# Start nginx
nginx
