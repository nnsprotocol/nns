import createRouter, { Middleware } from "lambda-api";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import registerHandler from "../register/sign";
import availabilityHandler from "../register/availability";
import resolveHandler from "../resolver/resolve";
import domainMetadataHandler from "../metadata/domain";
import { ZodError } from "zod";
import { StatusError } from "../shared/errors";

export const router = createRouter();

const onlyMetadata: Middleware = (req, res, next) => {
  const { host } = req.headers;
  if (host?.includes("metadata")) {
    return next();
  }
  return res.status(404).json({
    error: "Route not found",
  });
};

router.post("/register", registerHandler);
router.get("/availability", availabilityHandler);
router.post("/resolve", resolveHandler);
router.get("/:chainId/:contract/:tokenId", onlyMetadata, domainMetadataHandler);

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
