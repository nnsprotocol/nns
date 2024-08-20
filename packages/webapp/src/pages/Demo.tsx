import { FormEvent, useState } from "react";
import { useRegistry, useSearchDomain } from "../services/graph";
import { CONTROLLER_ADDRESS, useDomainPrice } from "../services/controller";
import { formatUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import CONTROLLER_ABI from "../abi/IController";
import { normalize } from "viem/ens";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Demo() {
  return (
    <>
      <ConnectButton />
      <Search />
      <Register />
    </>
  );
}

const NOGGLES_REGISTRY_ID =
  "0x739305fdceb24221237c3dea9f36a6fcc8dc81b45730358192886e1510532739";

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
  const registry = useRegistry({ id: NOGGLES_REGISTRY_ID });

  const price = useDomainPrice({
    cldId: registry.data?.id,
    name,
  });

  const register = useWriteContract();
  function handleSubmit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    if (
      !name ||
      register.isPending ||
      !account.address ||
      !price ||
      !registry.data
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
        [normalize(name), registry.data?.name],
        registerAsPrimaryName,
        "0x0000000000000000000000000000000000000000",
        registry.data.hasExpiringNames ? 1 : 0,
      ],
    });
  }

  return (
    <div className="border p-3 m-4">
      <p>Register</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="type a name"
        />
        <label htmlFor="primaryname">Register as primary name</label>
        <input
          type="checkbox"
          name="primaryname"
          checked={registerAsPrimaryName}
          onChange={(e) => setRegisterAsPrimaryName(e.target.checked)}
        />
        <p>ETH: {price?.eth ? formatUnits(price.eth, 18) : "..."}</p>
        <p>USD: {price?.usd ? formatUnits(price.usd, 18) : "..."}</p>

        <input className="border bg-blue-200" type="submit" value="Register" />
      </form>
    </div>
  );
}
