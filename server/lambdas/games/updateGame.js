"use strinct";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { started } = JSON.parse(event.body);
  const { id } = event.pathParameters;

  const params = {
    TableName: "games",
    Key: {
      id: id,
    },
    UpdateExpression: "SET #started = :started",
    ExpressionAttributeValues: {
      ":started": started,
    },
    ExpressionAttributeNames: {
      "#started": "started",
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await documentClient.update(params).promise();
    responseBody = JSON.stringify(data);
    statusCode = 201;
  } catch (error) {
    responseBody = `unable to update game ${error}`;
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
