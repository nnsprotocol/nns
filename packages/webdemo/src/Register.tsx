import { Alert, Button, Select, Stack, Switch, TextInput } from "@mantine/core";
import { FormEvent, useState } from "react";
import { formatUnits, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useWriteContract } from "wagmi";
import CONTROLLER_ABI from "./services/abi/IController";
import { CONTROLLER_ADDRESS, useDomainPrice } from "./services/controller";
import { Registry, useDomain, useRegistries } from "./services/graph";

export default function Register() {
  const registries = useRegistries();
  const [name, setName] = useState("");
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [referer, setReferer] = useState<string>("");
  const [registerAsPrimaryName, setRegisterAsPrimaryName] = useState(true);
  const account = useAccount();
  const domain = useDomain({
    name,
    cldName: registry?.name,
  });

  const price = useDomainPrice({
    cldId: registry?.id,
    name,
  });

  const register = useWriteContract();
  function handleSubmit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    if (
      !registry ||
      !name ||
      register.isPending ||
      !account.address ||
      !price
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
        [normalize(name), registry.name],
        registerAsPrimaryName,
        isAddress(referer)
          ? referer
          : "0x0000000000000000000000000000000000000000",
        0,
      ],
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          required
          label="Name"
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          required
          label="Community"
          name="registry"
          placeholder="Pick value"
          data={registries.data?.map((r) => r.name) || []}
          value={registry?.name || ""}
          onChange={(r) => {
            setRegistry(registries.data?.find((reg) => reg.name === r) || null);
          }}
        />
        <TextInput
          label="Refereer's Wallet"
          name="referer"
          placeholder="Referer's Wallet"
          value={referer}
          onChange={(e) => setReferer(e.target.value)}
        />
        <Switch
          label="Set as primary name"
          name="reverse"
          checked={registerAsPrimaryName}
          onChange={(e) => setRegisterAsPrimaryName(e.currentTarget.checked)}
        />
        <TextInput
          contentEditable={false}
          disabled
          label="Price"
          name="price"
          placeholder="Type a name to see the price"
          value={price ? `$${formatUnits(price.usd, 18)}` : ""}
        />
        {price && domain.data && (
          <Alert variant="light" color="red" title="Domain not available" />
        )}
        <Button
          loading={register.isPending}
          type="submit"
          variant="filled"
          disabled={Boolean(domain.data)}
        >
          Register
        </Button>
      </Stack>
    </form>
  );
}
