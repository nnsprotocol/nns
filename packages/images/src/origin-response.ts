import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  CloudFrontRequest,
  CloudFrontResponseHandler,
  CloudFrontResultResponse,
} from "aws-lambda";
import { generateImage } from "./generate-image";

const s3 = new S3Client({
  region: "us-east-1",
});

export const handler: CloudFrontResponseHandler = async (event) => {
  let { response, request } = event.Records[0].cf;

  // Image was found, all good, we can return.
  if (response.status !== "403") {
    return response;
  }

  let imgReq: ImageRequest;
  try {
    imgReq = validateRequest(request);
  } catch (e) {
    return errorResponse(response, {
      status: 400,
      message: (e as Error).message,
    });
  }

  const name = await fetchName(imgReq);
  if (!name) {
    return errorResponse(response, {
      status: 404,
      message: "domain not found",
    });
  }

  const img = await generateImage(name, {
    apiId: process.env.HTMLCSSTOIMAGE_API_ID!,
    apiKey: process.env.HTMLCSSTOIMAGE_API_KEY!,
  });

  await uploadImage({
    ...imgReq,
    bucketName: getEnvVar(request, "x-env-bucket-name")!,
    data: img.data,
  });

  return successResponse(response, img.data);
};

type ImageRequest = {
  chainId: number;
  contract: string;
  tokenId: bigint;
};

function validateRequest(req: Pick<CloudFrontRequest, "uri">): ImageRequest {
  const parts = req.uri.split("/");
  if (parts.length !== 5) {
    throw new Error("invalid url");
  }

  const [_, chainIdStr, contract, tokenIdStr, image] = parts;
  if (image !== "image") {
    throw new Error("invalid url");
  }
  const chainId = parseInt(chainIdStr);
  if (isNaN(chainId)) {
    throw new Error("invalid chain id");
  }
  let tokenId: bigint;
  try {
    tokenId = BigInt(tokenIdStr);
  } catch {
    throw new Error("invalid token id");
  }

  return { chainId, tokenId, contract };
}

const GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/0.0.2/gn";

async function fetchName(req: ImageRequest): Promise<string | null> {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        domains(
          where: {
            registry_: { address: "${req.contract.toLowerCase()}" }
            tokenId: "${req.tokenId.toString(10)}"
          }
        ) {
          name
        } 
      }`,
    }),
  });
  const body = (await res.json()) as {
    data: { domains: { name: string }[] } | null;
  };

  return body.data?.domains[0]?.name ?? null;
}

function getEnvVar(request: Pick<CloudFrontRequest, "origin">, name: string) {
  return request.origin?.s3?.customHeaders[name][0].value;
}

async function uploadImage(
  d: ImageRequest & { bucketName: string; data: Buffer }
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: d.bucketName,
      Key: `${d.chainId}/${d.contract}/${d.tokenId.toString(10)}/image`,
      ContentType: "image/png",
      CacheControl: "max-age=31536000",
      Body: d.data,
    })
  );
}

function successResponse(
  response: CloudFrontResultResponse,
  imageData: Buffer
) {
  response.status = "200";
  response.body = imageData.toString("base64");
  response.bodyEncoding = "base64";
  response.headers = {
    ...response.headers,
    "content-type": [{ key: "Content-Type", value: "text/plain" }],
  };
  return response;
}

function errorResponse(
  response: CloudFrontResultResponse,
  error: { status: number; message: string }
) {
  response.status = error.status.toString();
  response.body = error.message;
  response.bodyEncoding = "text";
  response.headers = {
    ...response.headers,
    "content-type": [{ key: "Content-Type", value: "text/plain" }],
  };
  return response;
}
