"use strinct";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { gameId } = event.pathParameters;

  const params = {
    TableName: "players",
    FilterExpression: "gameId = :gameId",
    ExpressionAttributeValues: {
      ":gameId": gameId,
    },
  };

  try {
    const data = await documentClient.scan(params).promise();
    let itemPromise = null;

    if (data.Count > 0) {
      itemPromise = data.Items.map(async (item) => {
        const deleteParams = {
          TableName: "players",
          Key: {
            id: item.id,
          },
        };
        return await documentClient.delete(deleteParams).promise();
      });
      responseBody = await Promise.all(itemPromise);
    }
    statusCode = 201;
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
    body: JSON.stringify(responseBody),
  };

  return response;
};
