import { AutoRouter, json, error, cors, StatusError } from "itty-router";
import registerHandler from "../register/sign";
import availabilityHandler from "../register/availability";
import { ZodError } from "zod";

const { preflight, corsify } = cors();

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
  format: json,
  catch: (err) => {
    if (err instanceof ZodError) {
      return error(400, {
        details: err.errors,
        error: "invalid_input",
      });
    }
    if (!(err instanceof StatusError)) {
      console.error(err);
      return error(500, { error: "internal_error" });
    }
    return error(err);
  },
});

router.post("/register", registerHandler);
router.get("/availability", availabilityHandler);

export default { ...router };
