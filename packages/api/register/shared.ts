import { Alchemy, Network } from "alchemy-sdk";
import { StatusError } from "itty-router";
import {
  Address,
  isAddress,
  isAddressEqual,
  keccak256,
  toBytes,
  zeroAddress,
} from "viem";
import { normalize } from "viem/ens";
import z from "zod";
import { Env } from "../env";

export const zAddress = z.custom<Address>(
  (val) => typeof val === "string" && isAddress(val)
);

type ContractInfo = {
  address: Address;
  network: Network;
};

export class RegistrationValidator {
  constructor(
    private readonly alchemyApiKey: string,
    private readonly nnsERC721: ContractInfo,
    private readonly nounsERC721: ContractInfo,
    private readonly nounsERC20: ContractInfo
  ) {}

  static fromEnv(env: Env) {
    return new RegistrationValidator(
      env.ALCHEMY_API_KEY,
      {
        address: env.NNS_V1_ERC721_ADDRESS,
        network: env.NNS_V1_ERC721_NETWORK,
      },
      { address: env.NOUNS_ERC721_ADDRESS, network: env.NOUNS_ERC721_NETWORK },
      { address: env.NOUNS_ERC20_ADDRESS, network: env.NOUNS_ERC20_NETWORK }
    );
  }

  async validateNoggles(to: Address, name: string) {
    if (isAddressEqual(to, zeroAddress)) {
      return false;
    }

    const tokenId = BigInt(keccak256(toBytes(normalize(name))));
    const owner = await this.fetchERC721Owner(this.nnsERC721, tokenId);

    if (owner && !isAddressEqual(owner, to)) {
      return false;
    }
    return true;
  }

  async validateNouns(to: Address, name: string) {
    if (isAddressEqual(to, zeroAddress)) {
      return false;
    }

    const nameAsNumber = parseInt(name, 10);
    if (isNaN(nameAsNumber)) {
      const [erc721Balance, erc20Balance] = await Promise.all([
        this.fetchERC721Balance(this.nounsERC721, to),
        this.fetchERC20Balance(this.nounsERC20, to),
      ]);
      return erc721Balance > 0n || erc20Balance > 0n;
    }

    const owner = await this.fetchERC721Owner(
      this.nounsERC721,
      BigInt(nameAsNumber)
    );
    if (owner && !isAddressEqual(owner, to)) {
      return false;
    }
    return true;
  }

  private async fetchERC721Owner(
    contract: ContractInfo,
    tokenId: bigint
  ): Promise<Address | null> {
    const alchemy = this.newAlchemyClient(contract.network);

    const res = await alchemy.nft
      .getOwnersForNft(contract.address, tokenId)
      .catch((e) => {
        if (e.message.includes("ERC721: invalid token ID")) {
          return null;
        }
        console.error("error calling getOwnersForNft", e);
        throw new StatusError(500);
      });
    if (!res?.owners || res.owners.length === 0) {
      return null;
    }
    if (res.owners.length > 1) {
      console.error("multiple owners for NFT", res);
      throw new StatusError(500);
    }
    return res.owners[0] as Address;
  }

  private async fetchERC721Balance(
    contract: ContractInfo,
    owner: Address
  ): Promise<bigint> {
    const alchemy = this.newAlchemyClient(contract.network);

    const res = await alchemy.nft.getNftsForOwner(owner, {
      contractAddresses: [contract.address],
      omitMetadata: true,
    });
    const v = res.ownedNfts.find((nft) =>
      isAddressEqual(nft.contractAddress as Address, contract.address)
    );
    return BigInt(v?.balance || 0);
  }

  private async fetchERC20Balance(
    contract: ContractInfo,
    owner: Address
  ): Promise<bigint> {
    const alchemy = this.newAlchemyClient(contract.network);

    const res = await alchemy.core.getTokenBalances(owner, [contract.address]);
    const v = res.tokenBalances.find((t) =>
      isAddressEqual(t.contractAddress as Address, contract.address)
    );
    return BigInt(v?.tokenBalance || 0);
  }

  private newAlchemyClient(network: Network) {
    return new Alchemy({
      apiKey: this.alchemyApiKey,
      network,
      connectionInfoOverrides: {
        skipFetchSetup: true,
      },
    });
  }
}
