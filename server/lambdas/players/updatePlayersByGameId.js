"use strinct";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { gameId, ready } = JSON.parse(event.body);

  const params = {
    TableName: "players",
    FilterExpression: "gameId = :gameId",
    ExpressionAttributeValues: {
      ":gameId": gameId,
    },
  };

  try {
    const data = await documentClient.scan(params).promise();

    if (data.Count > 0) {
      data.Items.map(async (item) => {
        const updateParams = {
          TableName: "players",
          Key: {
            id: item.id,
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

        await documentClient.update(updateParams).promise();
      });
    }

    //responseBody = JSON.stringify();
    responseBody = "updated";
    statusCode = 200;
  } catch (error) {
    responseBody = `unable to get player ${error}`;
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
