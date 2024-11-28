import { ErrorHandlingMiddleware, API, Request, Response } from "lambda-api";
import { ZodError } from "zod";
import { StatusError } from "../shared/errors";

export function setupRouter(router: API) {
  router.options("/*", (_req: Request, res: Response) => {
    res.cors({}).send({});
  });
  router.use(errorMiddleware());
}

function errorMiddleware(): ErrorHandlingMiddleware {
  return (err, _req, res, _next) => {
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
    if (err.name === "RouteError") {
      return res.status(404).json({
        error: "route_not_found",
      });
    }
    if (err.name === "MethodError") {
      return res.status(405).json({
        error: "method_not_allowed",
      });
    }
    console.error(err);
    return res.status(500).json({
      error: "internal_error",
    });
  };
}
