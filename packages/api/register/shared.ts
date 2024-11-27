import {
  Address,
  erc20Abi,
  erc721Abi,
  isAddressEqual,
  keccak256,
  toBytes,
  zeroAddress,
} from "viem";
import { normalize } from "viem/ens";
import { createChainClient, Network } from "../shared/chain";
import config from "../shared/config";
import NNS_STAKING_ABI from "../abi/NNSStaking";

export const isValidDomainName = (v: string) => {
  try {
    normalize(v);
    return true;
  } catch {
    return false;
  }
};

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
    private readonly nounsERC20: ContractInfo,
    private readonly nnsStaking: ContractInfo
  ) {}

  static fromConfig() {
    return new RegistrationValidator(
      {
        address: config.NNS_V1_ERC721_ADDRESS,
        network: config.NNS_V1_ERC721_NETWORK,
      },
      {
        address: config.NOUNS_ERC721_ADDRESS,
        network: config.NOUNS_ERC721_NETWORK,
      },
      {
        address: config.NOUNS_ERC20_ADDRESS,
        network: config.NOUNS_ERC20_NETWORK,
      },
      {
        address: config.NNS_V1_STAKING_ADDRESS,
        network: config.NNS_V1_STAKING_NETWORK,
      }
    );
  }

  async validateNoggles(to: Address, name: string): Promise<ValidationResult> {
    const owner = await this.fetchNNSV1Owner(name, to);
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
    const nameAsNumber = parseInt(name, 10);
    if (isNaN(nameAsNumber)) {
      const nnsOwner = await this.fetchNNSV1Owner(name, to);
      if (nnsOwner) {
        return {
          canRegister: isAddressEqual(nnsOwner, to),
          isFree: false,
        };
      }
      const [erc721Balance, erc20Balance] = await Promise.all([
        this.fetchERC721Balance(this.nounsERC721, to),
        this.fetchERC20Balance(this.nounsERC20, to),
      ]);
      const hasTokens = erc721Balance > 0n || erc20Balance > 0n;
      return {
        canRegister: hasTokens,
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
    const pc = createChainClient(contract.network);
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

  private async fetchNNSV1Owner(
    name: string,
    targetWallet: Address
  ): Promise<Address | null> {
    const tokenId = BigInt(keccak256(toBytes(normalize(name))));
    const owner = await this.fetchERC721Owner(this.nnsERC721, tokenId);
    if (!owner) {
      return null;
    }
    if (isAddressEqual(owner, this.nnsStaking.address)) {
      // This name has been staked so we need to check who the actual owner is.
      const c = createChainClient(this.nnsStaking.network);
      const [stakes] = await c.readContract({
        abi: NNS_STAKING_ABI,
        functionName: "getStakes",
        args: [targetWallet],
        address: this.nnsStaking.address,
      });
      for (const s of stakes) {
        if (s.endTime === 0n && s.tokenId === tokenId) {
          return targetWallet;
        }
      }
    }
    return owner;
  }

  private async fetchERC721Balance(
    contract: ContractInfo,
    owner: Address
  ): Promise<bigint> {
    if (isAddressEqual(owner, zeroAddress)) {
      return 0n;
    }

    const pc = createChainClient(contract.network);
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
    if (isAddressEqual(owner, zeroAddress)) {
      return 0n;
    }

    const pc = createChainClient(contract.network);
    return await pc.readContract({
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
      address: contract.address,
    });
  }
}
