FROM amazon/dynamodb-local:latest
ENV NODE_ENV=development
WORKDIR /home/dynamodblocal
EXPOSE 8000
RUN mkdir ./db && chown -R 1000 ./db || true
CMD ["-jar", "DynamoDBLocal.jar", "-dbPath", "./db", "-sharedDb"]
VOLUME ["./db"]