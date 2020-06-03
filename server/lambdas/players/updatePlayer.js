"use strinct";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { id, ready } = JSON.parse(event.body);

  const params = {
    TableName: "players",
    Key: {
      id: id,
    },
    UpdateExpression: "SET #ready = :newReady",
    ExpressionAttributeValues: {
      ":newReady": ready,
    },
    ExpressionAttributeNames: {
      "#ready": "ready",
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await documentClient.update(params).promise();
    responseBody = JSON.stringify(data);
    statusCode = 201;
  } catch (error) {
    responseBody = `unable to update player ${error}`;
    statusCode = 403;
  }

  const response = {
    isBase64Encoded: false,
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: responseBody,
  };

  return response;
};
