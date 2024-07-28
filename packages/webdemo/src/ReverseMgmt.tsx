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
import { useMemo, useState } from "react";
import { Address, isAddress, namehash } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";
import RESOLVER_ABI from "./services/abi/IResolver";
import {
  Domain,
  Registry,
  Subdomain,
  useDomains,
  useRegistries,
} from "./services/graph";
import { RESOLVER_ADDRESS } from "./services/resolver";
import { RECORDS } from "./Records";

export default function ReverseMgmt() {
  const registries = useRegistries();
  const account = useAccount();
  const [defaultRegistry, setDefaultRegistry] = useState<Registry | null>(null);

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
      <PrimaryNameCLD registries={registries.data || []} />
      <ResolveAddress registries={registries.data || []} />
      <ResolveName registries={registries.data || []} />
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

function getRegistry(v: Domain | Subdomain) {
  if ("registry" in v) {
    return v.registry.address;
  }
  return v.parent.registry.address;
}

function PrimaryNameCLD(props: { registries: Registry[] }) {
  const account = useAccount();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [domain, setDomain] = useState<Domain | Subdomain | null>(null);
  const domains = useDomains({
    owner: account.address,
  });
  const reverse = useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "reverseNameOf",
    args: [account.address!, [BigInt(registry?.id || "0x0")], false],
    query: {
      enabled: Boolean(registry) && Boolean(account.address),
    },
  });

  const possibleNames = useMemo(() => {
    const d = domains.data?.filter((d) => d.registry.id === registry?.id) || [];
    const subdomains = d.flatMap((d) => d.subdomains || []);

    return [...d, ...subdomains];
  }, [domains.data, registry]);

  const setReverse = useWriteContract({
    mutation: {
      onSuccess() {
        setTimeout(() => {
          reverse.refetch();
        }, 2000);
      },
    },
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack>
        <Group align="end" grow>
          <Select
            label="Change primary name in CLD"
            name="registry"
            placeholder="Pick value"
            data={props.registries.map((r) => r.name) || []}
            value={registry?.name || ""}
            onChange={(r) => {
              setRegistry(
                props.registries.find((reg) => reg.name === r) || null
              );
              setDomain(null);
            }}
          />
          <TextInput disabled value={reverse.data || "..."} />
        </Group>
        <Group align="end" grow>
          <Select
            label="Choose a domain to change"
            name="domain"
            disabled={!Boolean(registry) || !Boolean(domains.data)}
            placeholder="Pick value"
            data={possibleNames?.map((r) => r.name) || []}
            value={domain?.name || ""}
            onChange={(r) => {
              setDomain(possibleNames.find((d) => d.name === r) || null);
            }}
          />
          <Button
            disabled={!Boolean(registry) || !Boolean(domain)}
            loading={setReverse.isPending}
            onClick={() => {
              {
                setReverse.writeContract({
                  abi: REGISTRY_ABI,
                  address: getRegistry(domain!),
                  functionName: "setReverse",
                  args: [
                    BigInt(domain?.id || 0),
                    [BigInt(namehash("crypto.ETH.address"))],
                    [account.address?.toLowerCase() || ""],
                  ],
                });
              }
            }}
          >
            Change
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

function ResolveName(props: { registries: Registry[] }) {
  const [name, setName] = useState("");

  const tokenId = useMemo(() => {
    return namehash(name);
  }, [name]);

  const registryAddress = useMemo(() => {
    const bits = name.split(".");
    if (bits.length < 2) {
      return;
    }
    const cld = bits[bits.length - 1];
    const registry = props.registries.find((r) => r.name === cld);
    return registry?.address;
  }, [name]);

  const record = useReadContract({
    abi: REGISTRY_ABI,
    address: registryAddress,
    functionName: "recordOf",
    args: [BigInt(tokenId), BigInt(RECORDS.CRYPTO_ETH.id)],
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group align="end" grow>
        <TextInput
          label="Resolve a name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          label="Resolved address"
          placeholder="No address found"
          disabled
          value={record.data}
        />
      </Group>
    </Card>
  );
}
