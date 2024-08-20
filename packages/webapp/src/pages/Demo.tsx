import { useState } from "react";
import { useSearchDomain } from "../services/graph";
import { useDomainPrice } from "../services/controller";
import { formatUnits } from "viem";

export default function Demo() {
  return (
    <>
      <Search />
      <Price />
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

function Price() {
  const [text, setText] = useState("");
  const price = useDomainPrice({
    name: text,
    cldId: NOGGLES_REGISTRY_ID,
  });

  return (
    <div className="border p-3 m-4">
      <p>Price</p>
      <input
        type="text"
        className="w-full"
        placeholder="type a name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p>ETH: {price?.eth ? formatUnits(price.eth, 18) : "..."}</p>
      <p>USD: {price?.usd ? formatUnits(price.usd, 18) : "..."}</p>
    </div>
  );
}
