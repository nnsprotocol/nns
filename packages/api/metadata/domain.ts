import { IRequest, StatusError } from "itty-router";
import { isAddress } from "viem";
import { Env } from "../env";
import { fetchTokenInfo } from "./graph";

const CDN_URL = "https://d321vfgto7sq2r.cloudfront.net";

type Attribute = {
  traitType: string;
  displayType: string;
  value: any;
};

type Metadata = {
  name: string;
  description: string;
  attributes: Attribute[];
  url?: string;
  version: number;
  image_url: string;
  image: string;
};

export default async function domainMetadataHandler(
  req: IRequest,
  env: Env
): Promise<Metadata> {
  const params = validateRequest(req.params);
  if (!params) {
    throw new StatusError(404, "domain_not_found");
  }
  const info = await fetchTokenInfo(params);
  if (!info) {
    throw new StatusError(404, "domain_not_found");
  }

  let description = `${info.name} is an NNS name`;
  if (info.type === "resolvingToken") {
    description = `Token issued to ${info.name} for resolving NNS names`;
  }

  const imgUrl = `${CDN_URL}/${params.chainId}/${params.contract}/${params.tokenId}/image`;
  return {
    name: info.name,
    description,
    attributes: [],
    // url: undefined,
    version: 0,
    image_url: imgUrl,
    image: imgUrl,
  };
}

function validateRequest(params: Record<string, string>) {
  const chainId = parseInt(params.chainId);
  if (isNaN(chainId)) {
    return null;
  }
  let tokenId: bigint;
  try {
    tokenId = BigInt(params.tokenId);
  } catch {
    return null;
  }
  if (!isAddress(params.contract)) {
    return null;
  }

  return { chainId, tokenId, contract: params.contract };
}
