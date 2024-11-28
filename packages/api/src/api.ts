import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import createRouter from "lambda-api";
import availabilityHandler from "../register/availability";
import registerHandler from "../register/sign";
import resolveHandler from "../resolver/resolve";
import { setupRouter } from "./shared";

export const router = createRouter();

setupRouter(router);

router.post("/register", registerHandler);
router.get("/availability", availabilityHandler);
router.post("/resolve", resolveHandler);

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return await router.run(event, context);
};
