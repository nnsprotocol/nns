import { IRequest, StatusError } from "itty-router";
import { normalize } from "viem/ens";
import z from "zod";
import { validateNoggles, zAddress } from "./shared";

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
  const input = await inputSchema.parseAsync(req.query);

  const cld = input.cld;
  const name = normalize(input.name);

  let canRegister = false;
  switch (cld) {
    case "⌐◨-◨": {
      canRegister = await validateNoggles({
        contract: env.NNS_V1_ERC721_ADDRESS,
        name,
        to: input.to,
      });
      break;
    }

    default:
      throw new StatusError(400, "unsupported_cld");
  }

  return { canRegister };
}
