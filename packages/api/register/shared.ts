import {
  Address,
  createPublicClient,
  erc20Abi,
  erc721Abi,
  http,
  isAddress,
  isAddressEqual,
  keccak256,
  toBytes,
  zeroAddress,
} from "viem";
import { base, baseSepolia, mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import z from "zod";
import { Env } from "../env";

export const isValidDomainName = (v: string) => {
  try {
    normalize(v);
    return true;
  } catch {
    return false;
  }
};

export enum Network {
  ETH_MAINNET = "eth-mainnet",
  BASE_MAINNET = "base-mainnet",
  BASE_SEPOLIA = "base-sepolia",
}

type ContractInfo = {
  address: Address;
  network: Network;
};

type ValidationResult = {
  canRegister: boolean;
  isFree: boolean;
};

export class RegistrationValidator {
  constructor(
    private readonly nnsERC721: ContractInfo,
    private readonly nounsERC721: ContractInfo,
    private readonly nounsERC20: ContractInfo
  ) {}

  static fromEnv(env: Env) {
    return new RegistrationValidator(
      {
        address: env.NNS_V1_ERC721_ADDRESS,
        network: env.NNS_V1_ERC721_NETWORK,
      },
      { address: env.NOUNS_ERC721_ADDRESS, network: env.NOUNS_ERC721_NETWORK },
      { address: env.NOUNS_ERC20_ADDRESS, network: env.NOUNS_ERC20_NETWORK }
    );
  }

  async validateNoggles(to: Address, name: string): Promise<ValidationResult> {
    if (isAddressEqual(to, zeroAddress) || name.length < 3) {
      return {
        canRegister: false,
        isFree: false,
      };
    }

    const tokenId = BigInt(keccak256(toBytes(normalize(name))));
    const owner = await this.fetchERC721Owner(this.nnsERC721, tokenId);
    if (owner) {
      const isOwner = isAddressEqual(owner, to);
      return {
        canRegister: isOwner,
        isFree: isOwner,
      };
    }

    return {
      canRegister: true,
      isFree: false,
    };
  }

  async validateNouns(to: Address, name: string): Promise<ValidationResult> {
    if (isAddressEqual(to, zeroAddress)) {
      return {
        canRegister: false,
        isFree: false,
      };
    }

    const nameAsNumber = parseInt(name, 10);
    if (isNaN(nameAsNumber)) {
      if (name.length < 3) {
        return {
          canRegister: false,
          isFree: false,
        };
      }
      const [erc721Balance, erc20Balance] = await Promise.all([
        this.fetchERC721Balance(this.nounsERC721, to),
        this.fetchERC20Balance(this.nounsERC20, to),
      ]);
      return {
        canRegister: erc721Balance > 0n || erc20Balance > 0n,
        isFree: false,
      };
    }

    const owner = await this.fetchERC721Owner(
      this.nounsERC721,
      BigInt(nameAsNumber)
    );
    if (owner && !isAddressEqual(owner, to)) {
      return {
        canRegister: false,
        isFree: false,
      };
    }

    return {
      canRegister: true,
      isFree: false,
    };
  }

  private async fetchERC721Owner(
    contract: ContractInfo,
    tokenId: bigint
  ): Promise<Address | null> {
    const pc = this.newPublicClient(contract.network);
    return await pc
      .readContract({
        abi: erc721Abi,
        functionName: "ownerOf",
        args: [tokenId],
        address: contract.address,
      })
      .catch((err: Error) => {
        if (err.message.includes("ERC721: invalid token ID")) {
          return null;
        }
        throw err;
      });
  }

  private async fetchERC721Balance(
    contract: ContractInfo,
    owner: Address
  ): Promise<bigint> {
    const pc = this.newPublicClient(contract.network);
    return await pc.readContract({
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [owner],
      address: contract.address,
    });
  }

  private async fetchERC20Balance(
    contract: ContractInfo,
    owner: Address
  ): Promise<bigint> {
    const pc = this.newPublicClient(contract.network);
    return await pc.readContract({
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
      address: contract.address,
    });
  }

  private newPublicClient(network: Network) {
    let chain;
    switch (network) {
      case Network.ETH_MAINNET:
        chain = mainnet;
        break;
      case Network.BASE_SEPOLIA:
        chain = baseSepolia;
        break;
      case Network.BASE_MAINNET:
        chain = base;
        break;
      default:
        throw new Error("unsupported network " + network);
    }

    return createPublicClient({
      chain,
      transport: http(),
    });
  }
}
