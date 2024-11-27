import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import createRouter from "lambda-api";
import { ZodError } from "zod";
import domainMetadataHandler from "../metadata/domain";
import { StatusError } from "../shared/errors";

export const router = createRouter();

router.get("/:chainId/:contract/:tokenId", domainMetadataHandler);

router.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      details: err.errors,
      error: "invalid_input",
    });
  }
  if (err instanceof StatusError) {
    return res.status(err.status).json({
      error: err.message,
    });
  }
  console.error(err);
  return res.status(500).json({
    error: "internal_error",
  });
});

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return await router.run(event, context);
};
