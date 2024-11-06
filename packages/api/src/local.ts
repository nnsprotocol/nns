import http from 'http';
import { router } from './lambda';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

const serverWrapper = http.createServer(function (request, response) {
  const url = new URL(request.url!, `http://${request.headers.host}/`);

  // The event object we're faking is a lightweight based on:
  // https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request
  const event = {
    httpMethod: request.method!.toUpperCase(),
    path: url.pathname,
    resource: "/{proxy+}",
    queryStringParameters: [...url.searchParams.keys()].reduce(
      (output, key) => {
        output[key] = url.searchParams.get(key);
        return output;
      },
      {} as Record<string, string | null>
    ),
    headers: request.headers,
    requestContext: {},
    pathParameters: {},
    stageVariables: {},
    isBase64Encoded: false,
    body: request.body,
  } as unknown as APIGatewayProxyEventV2;

  router
    .run(event, {} as Context)
    .then((res) => {
      let { body, headers, statusCode } = res;

      if (res.isBase64Encoded) {
        body = Buffer.from(body, "base64");
      }

      if (!headers["content-length"] && body) {
        headers["content-length"] = body.length;
      }

      response.writeHead(statusCode, headers);
      response.end(body);
    })
    .catch((err) => {
      console.error("Something went horribly, horribly wrong");
      console.error(err);
      response.writeHead(500, { "content-length": 0 });
      response.end("");
    });
});

serverWrapper.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on http://localhost:${serverWrapper.address().port}/`);
});
