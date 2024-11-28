import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import createRouter from "lambda-api";
import domainMetadataHandler from "../metadata/domain";
import { setupRouter } from "./shared";

export const router = createRouter();

setupRouter(router);

router.get("/:chainId/:contract/:tokenId", domainMetadataHandler);

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return await router.run(event, context);
};
