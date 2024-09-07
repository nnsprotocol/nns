import { AutoRouter, json, error, cors } from "itty-router";
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
    return error(err);
  },
});

router.post("/register", registerHandler);
router.get("/availability", availabilityHandler);

export default { ...router };
