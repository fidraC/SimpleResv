# Basic stuff
FROM ubuntu:22.04
MAINTAINER acheong@student.dalat.org
# Get Dependencies
RUN apt-get update
RUN apt-get install python3 python3-pip -y
RUN python3 -m pip install timestamp flask
CMD ["echo", "Dependencies installed"]
# Files
COPY . /app
WORKDIR /app
# Expose ports
EXPOSE 6969/tcp
# Run app
CMD python3 app.py

