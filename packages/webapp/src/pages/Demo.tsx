import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FormEvent, useCallback, useState } from "react";
import { Address, formatUnits, isAddressEqual, namehash } from "viem";
import { normalize } from "viem/ens";
import { useAccount } from "wagmi";
import CONTROLLER_ABI from "../abi/IController";
import REGISTRY_ABI from "../abi/IRegistry";
import RESOLVER_ABI from "../abi/IResolver";
import { CONTROLLER_ADDRESS, useDomainPrice } from "../services/controller";
import {
  Domain,
  Registry,
  useCollectionPreview,
  useDomains,
  useRegistries,
  useSearchDomain,
} from "../services/graph";
import {
  RESOLVER_ADDRESS,
  useDefaultCld,
  useResolvedName,
} from "../services/resolver";
import { useWriteContractWaitingForTx } from "../services/shared";

const NOGGLES_REGISTRY_ID =
  "0x739305fdceb24221237c3dea9f36a6fcc8dc81b45730358192886e1510532739";

export default function Demo() {
  return (
    <>
      <ConnectButton />
      <Search />
      <Register />
      <Profile />
      <Collections />
      <CollectionMgmtList />
    </>
  );
}

function Search() {
  const [text, setText] = useState("");
  const search = useSearchDomain({
    cldId: NOGGLES_REGISTRY_ID,
    name: text,
  });

  return (
    <div className="border p-3 m-4">
      <p>Search</p>
      <input
        type="text"
        className="w-full"
        placeholder="type 'd' to get some results"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {search.data?.map((domain) => (
        <div key={domain.id}>{domain.name}</div>
      ))}
    </div>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [registerAsPrimaryName, setRegisterAsPrimaryName] = useState(true);
  const account = useAccount();
  const registries = useRegistries();
  const [selectedRegisty, setSelectedRegistry] = useState<Registry | null>(
    null
  );

  const price = useDomainPrice({
    cldId: selectedRegisty?.id,
    name,
  });

  const onSelectRegistryChange = useCallback(
    (value: string) => {
      const reg = registries.data?.find((r) => r.id === value)!;
      setSelectedRegistry(reg);
    },
    [registries.data]
  );

  const register = useWriteContractWaitingForTx();
  function handleSubmit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    if (
      !name ||
      register.isLoading ||
      !account.address ||
      !price ||
      !selectedRegisty
    ) {
      return;
    }

    register.writeContract({
      abi: CONTROLLER_ABI,
      address: CONTROLLER_ADDRESS,
      functionName: "register",
      value: (price.eth * 11n) / 10n,
      args: [
        account.address,
        [normalize(name), selectedRegisty?.name || ""],
        registerAsPrimaryName,
        "0x0000000000000000000000000000000000000000",
        selectedRegisty?.hasExpiringNames ? 1 : 0,
      ],
    });
  }

  return (
    <div className="border p-3 m-4">
      <p>Register</p>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="type a name"
        />
        <label htmlFor="registry">Select registry</label>
        <select
          name="registry"
          onChange={(e) => onSelectRegistryChange(e.target.value)}
        >
          {registries.data?.map((registry) => (
            <option key={registry.id} value={registry.id}>
              {registry.name}
            </option>
          ))}
        </select>
        <label htmlFor="primaryname">Register as primary name</label>
        <input
          type="checkbox"
          name="primaryname"
          checked={registerAsPrimaryName}
          onChange={(e) => setRegisterAsPrimaryName(e.target.checked)}
        />
        <p>ETH: {price?.eth ? formatUnits(price.eth, 18) : "..."}</p>
        <p>USD: {price?.usd ? formatUSD(price.usd) : "..."}</p>

        <p>Tx status: {register.state.value}</p>

        <input
          className="border bg-blue-200"
          type="submit"
          disabled={register.isLoading}
          value="Register"
        />
      </form>
    </div>
  );
}

function Collections() {
  const account = useAccount();
  const collections = useCollectionPreview({ owner: account.address });
  const defaultCld = useDefaultCld({ account: account.address });

  const setDefaultCld = useWriteContractWaitingForTx();
  function handleSetDefaultCld(cldId: bigint) {
    if (setDefaultCld.isLoading || !account.address) {
      return;
    }

    setDefaultCld.writeContract({
      abi: RESOLVER_ABI,
      address: RESOLVER_ADDRESS,
      functionName: "setDefaultCld",
      args: [account.address, cldId],
    });
  }

  return (
    <div className="border p-3 m-4">
      <p>Collections</p>
      {collections.data?.map((collection) => (
        <table
          key={collection.registry.id}
          className="border-collapse border border-gray-300 w-full"
        >
          <thead className="bg-gray-200">
            <tr>
              <th>{collection.registry.name}</th>
              <th>{collection.numberOfDomains} Domains</th>
              <th>
                Resolving as:{" "}
                {collection.registry.primaryDomain?.[0]?.name || "no primary"}
              </th>
              <th>
                {defaultCld.data === BigInt(collection.registry.id) ? (
                  "Default registry"
                ) : (
                  <button
                    onClick={() =>
                      handleSetDefaultCld(BigInt(collection.registry.id))
                    }
                    disabled={setDefaultCld.isLoading}
                  >
                    Set as default
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {collection.registry.previewDomains?.map((domain, index) => (
              <tr
                key={domain.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="border border-gray-300 p-2">
                  <img
                    className="w-[50px] h-[50px] object-cover"
                    src={`https://picsum.photos/200?random=${domain.id}`}
                  />
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {domain.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function Profile() {
  const account = useAccount();
  const registries = useRegistries();
  const [selectedCld, setSelectedCld] = useState<bigint | null>(null);
  const name = useResolvedName({
    account: account.address,
    cldId: selectedCld || undefined,
  });

  const onSelectChange = useCallback(
    (value: string) => {
      if (value === "default") {
        setSelectedCld(null);
      } else {
        const reg = registries.data?.find((r) => r.id === value)!;
        setSelectedCld(BigInt(reg.id));
      }
    },
    [registries.data]
  );

  return (
    <div className="border p-3 m-4">
      <p>{formatAddress(account.address)}</p>
      <p>
        Known as <b>{name.data || "..."}</b>
      </p>
      <label>
        in{"  "}
        <select onChange={(e) => onSelectChange(e.target.value)}>
          <option value="default">Default</option>
          {registries.data?.map((registry) => (
            <option key={registry.id} value={registry.id}>
              {registry.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CollectionMgmtList() {
  const registries = useRegistries();
  return (
    <>
      {registries.data?.map((registry) => (
        <CollectionMgmt key={registry.id} registry={registry} />
      ))}
    </>
  );
}

function CollectionMgmt(props: { registry: Registry }) {
  const account = useAccount();
  const domains = useDomains({
    cldId: props.registry.id,
    owner: account.address,
  });

  const setPrimary = useWriteContractWaitingForTx();
  function handleSetPrimary(domainId: bigint) {
    if (setPrimary.isLoading || !account.address) {
      return;
    }

    setPrimary.writeContract({
      abi: REGISTRY_ABI,
      address: props.registry.address,
      functionName: "setReverse",
      args: [
        domainId,
        [BigInt(namehash("crypto.ETH.address"))],
        [account.address.toLowerCase()],
      ],
    });
  }

  return (
    <div className="border p-3 m-4">
      <p>Collection {props.registry.name}</p>
      <table className="border-collapse border border-gray-300 w-full">
        <thead className="bg-gray-200">
          <tr>
            <th colSpan={2}>Name</th>
            {props.registry.hasExpiringNames ? <th>Expires</th> : null}
            <th>Primary</th>
            {props.registry.hasExpiringNames ? <th>Renew</th> : null}
          </tr>
        </thead>
        <tbody>
          {domains.data?.map((domain, index) => (
            <tr
              key={domain.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="border border-gray-300 p-2">
                <img
                  className="w-[50px] h-[50px] object-cover"
                  src={`https://picsum.photos/200?random=${domain.id}`}
                />
              </td>
              <td className="border border-gray-300 p-2">{domain.name}</td>
              {props.registry.hasExpiringNames ? (
                <td className="border border-gray-300 p-2">
                  {new Date(Number(domain.expiry!) * 1000).toLocaleString()}
                </td>
              ) : null}
              <td className="border border-gray-300 p-2">
                {domain.resolvedAddress &&
                account.address &&
                isAddressEqual(domain.resolvedAddress, account.address) ? (
                  "Primary name"
                ) : (
                  <button
                    onClick={() => handleSetPrimary(BigInt(domain.id))}
                    disabled={setPrimary.isLoading}
                  >
                    Set as primary
                  </button>
                )}
              </td>
              {props.registry.hasExpiringNames ? (
                <td className="border border-gray-300 p-2">
                  <RenewButton domain={domain} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RenewButton(props: { domain: Domain }) {
  const price = useDomainPrice({
    cldId: props.domain.registry.id,
    name: props.domain.name,
  });
  const renew = useWriteContractWaitingForTx();
  function handleRenew() {
    if (!price) {
      return;
    }

    renew.writeContract({
      abi: CONTROLLER_ABI,
      address: CONTROLLER_ADDRESS,
      functionName: "renew",
      args: [props.domain.name.split("."), 1],
      value: (price.eth * 11n) / 10n,
    });
  }

  return (
    <button
      className="bg-red-200"
      onClick={() => handleRenew()}
      disabled={renew.isLoading}
    >
      Renew for 1y for {price ? formatUSD(price.usd) : "..."} USD
    </button>
  );
}

function formatAddress(address?: Address) {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 5)}...${address.slice(-4)}`.toLowerCase();
}

function formatUSD(v: bigint) {
  const value = parseFloat(formatUnits(v, 18));
  return "$" + Math.round(value);
}
