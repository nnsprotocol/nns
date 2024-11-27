import { Request } from "lambda-api";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import z from "zod";
import { isValidDomainName, RegistrationValidator } from "./shared";
import { StatusError } from "../shared/errors";

const inputSchema = z.object({
  to: z.string().refine(isAddress),
  cld: z.string(),
  name: z.string().refine(isValidDomainName),
});

type Output = {
  canRegister: boolean;
  isFree: boolean;
};

export default async function availabilityHandler(
  req: Request
): Promise<Output> {
  const validator = RegistrationValidator.fromConfig();

  const input = await inputSchema.parseAsync(req.query);

  const cld = decodeURIComponent(input.cld);
  const name = normalize(input.name);

  let validation;
  switch (cld) {
    case "⌐◨-◨": {
      validation = await validator.validateNoggles(input.to, name);
      break;
    }

    case "nouns": {
      validation = await validator.validateNouns(input.to, name);
      break;
    }

    default:
      throw new StatusError(400, "unsupported_cld");
  }

  return validation;
}
