import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import createRouter from "lambda-api";
import { ZodError } from "zod";
import availabilityHandler from "../register/availability";
import registerHandler from "../register/sign";
import resolveHandler from "../resolver/resolve";
import { StatusError } from "../shared/errors";

export const router = createRouter();

router.post("/register", registerHandler);
router.get("/availability", availabilityHandler);
router.post("/resolve", resolveHandler);

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
