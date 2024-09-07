import { IRequest, StatusError } from "itty-router";
import { normalize } from "viem/ens";
import z from "zod";
import { Env } from "../env";
import { RegistrationValidator, zAddress } from "./shared";

const inputSchema = z.object({
  to: zAddress,
  cld: z.string(),
  name: z.string(),
});

type Output = {
  canRegister: boolean;
};

export default async function availabilityHandler(
  req: IRequest,
  env: Env
): Promise<Output> {
  const validator = RegistrationValidator.fromEnv(env);

  const input = await inputSchema.parseAsync(req.query);

  const cld = input.cld;
  const name = normalize(input.name);

  let canRegister = false;
  switch (cld) {
    case "⌐◨-◨": {
      canRegister = await validator.validateNoggles(input.to, name);
      break;
    }

    case "nouns": {
      canRegister = await validator.validateNouns(input.to, name);
      break;
    }

    default:
      throw new StatusError(400, "unsupported_cld");
  }

  return { canRegister };
}
