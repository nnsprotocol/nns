import {
  Button,
  Card,
  Group,
  MultiSelect,
  Select,
  Space,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import RESOLVER_ABI from "./services/abi/IResolver";
import { Registry, useRegistries } from "./services/graph";
import { RESOLVER_ADDRESS } from "./services/resolver";
import { Address, isAddress } from "viem";

export default function ReverseMgmt() {
  const registries = useRegistries();
  const account = useAccount();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [defaultRegistry, setDefaultRegistry] = useState<Registry | null>(null);

  const cldReverse = useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "reverseNameOf",
    args: [account.address!, [BigInt(registry?.id || "0x0")], false],
    query: {
      enabled: Boolean(registry) && Boolean(account),
    },
  });
  const defaultReverse = useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "reverseNameOf",
    args: [account.address!],
    query: {
      enabled: Boolean(account),
    },
  });

  const updateDefault = useWriteContract({
    mutation: {
      onSettled() {
        setTimeout(() => {
          defaultReverse.refetch();
        }, 2000);
      },
    },
  });
  function handleUpdateDefaultCLD() {
    if (updateDefault.isPending || !account.address || !defaultRegistry) {
      return;
    }

    updateDefault.writeContract({
      abi: RESOLVER_ABI,
      address: RESOLVER_ADDRESS,
      functionName: "setDefaultCld",
      args: [account.address, BigInt(defaultRegistry.id)],
    });
  }

  return (
    <Stack>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <TextInput
          label="Your global primary name"
          disabled
          value={defaultReverse.data || "Loading..."}
        />
        <Space h="md" />
        <Group align="end" grow>
          <Select
            label="Change the default CLD"
            name="registry"
            placeholder="Pick value"
            data={registries.data?.map((r) => r.name) || []}
            value={defaultRegistry?.name || ""}
            onChange={(r) => {
              setDefaultRegistry(
                registries.data?.find((reg) => reg.name === r) || null
              );
            }}
          />
          <Button
            disabled={!Boolean(defaultRegistry)}
            onClick={handleUpdateDefaultCLD}
            loading={updateDefault.isPending}
          >
            Change
          </Button>
        </Group>
      </Card>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group align="end" grow>
          <Select
            label="Choose a CLD to see your primary name"
            name="registry"
            placeholder="Pick value"
            data={registries.data?.map((r) => r.name) || []}
            value={registry?.name || ""}
            onChange={(r) => {
              setRegistry(
                registries.data?.find((reg) => reg.name === r) || null
              );
            }}
          />
          <TextInput disabled value={cldReverse.data || "..."} />
        </Group>
      </Card>
      <ResolveAddress registries={registries.data || []} />
    </Stack>
  );
}

function ResolveAddress(props: { registries: Registry[] }) {
  const [selectedRegistries, setSelectedRegistries] = useState<Registry[]>([]);
  const [address, setAddress] = useState("");
  const [fallback, setFallback] = useState(false);

  const reverse = useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "reverseNameOf",
    args: [
      address as Address,
      selectedRegistries.map((r) => BigInt(r.id)),
      fallback,
    ],
    query: {
      enabled: isAddress(address),
    },
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group align="end" grow>
        <TextInput
          label="Resolve an address"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <MultiSelect
          label="Choose CLDs"
          name="registry"
          placeholder="CLDs"
          data={props.registries.map((r) => r.name) || []}
          value={selectedRegistries.map((r) => r.name)}
          onChange={(rs) => {
            setSelectedRegistries(
              props.registries.filter((r) => rs.includes(r.name))
            );
          }}
        />
      </Group>
      <Group align="end" grow>
        <TextInput
          label="Resolved name"
          placeholder="No reverse found"
          disabled
          value={reverse.data}
        />
        <Switch
          label="Enable fallback"
          checked={fallback}
          onChange={(e) => setFallback(e.target.checked)}
        />
      </Group>
    </Card>
  );
}
