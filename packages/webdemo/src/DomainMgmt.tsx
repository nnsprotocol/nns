import {
  Button,
  Card,
  Group,
  Space,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Hash, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useWriteContract } from "wagmi";
import Records from "./Records";
import REGISTRY_ABI from "./services/abi/IRegistry";
import { Domain, useDomain } from "./services/graph";

interface DomainMgmtProps {
  tokenId: Hash;
}

export default function DomainMgmt(props: DomainMgmtProps) {
  const domain = useDomain({ id: props.tokenId });

  if (!domain.data) {
    return null;
  }

  return (
    <div>
      <Title order={1}>{domain.data?.name}</Title>
      <Space h="md" />
      <Stack>
        <Approval domain={domain.data} />
        <Info domain={domain.data} />
        <Records
          tokenId={domain.data.id}
          registry={domain.data.registry.address}
        />
        <Transfer domain={domain.data} />
        <Subdomain domain={domain.data} />
      </Stack>
    </div>
  );
}

function Approval(props: { domain: Domain }) {
  const approve = useWriteContract();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleApprove() {
    if (approve.isPending) {
      return;
    }
    if (!isAddress(address)) {
      setError("Invalid address");
      return;
    }

    approve.writeContract({
      abi: REGISTRY_ABI,
      address: props.domain.registry.address,
      functionName: "approve",
      args: [address, BigInt(props.domain.id)],
    });
  }

  function handleApproveAll() {
    if (approve.isPending) {
      return;
    }
    if (!isAddress(address)) {
      setError("Invalid address");
      return;
    }

    approve.writeContract({
      abi: REGISTRY_ABI,
      address: props.domain.registry.address,
      functionName: "setApprovalForAll",
      args: [address, true],
    });
  }

  return (
    <Card>
      <Title order={4}>Approval</Title>
      <Space h="md" />
      <Group grow align="baseline">
        <TextInput
          error={error}
          placeholder="Address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError("");
          }}
        />
        <Button loading={approve.isPending} onClick={handleApprove}>
          Only {props.domain.name}
        </Button>
        <Button loading={approve.isPending} onClick={handleApproveAll}>
          All .{props.domain.registry.name}
        </Button>
      </Group>
    </Card>
  );
}

function Info(props: { domain: Domain }) {
  return (
    <Card>
      <Title order={4}>Info</Title>
      <Space h="md" />
      <Table striped withTableBorder withColumnBorders>
        <Table.Tbody>
          <Table.Tr key="owner">
            <Table.Td>Owner</Table.Td>
            <Table.Td>{props.domain.owner.id}</Table.Td>
          </Table.Tr>
          <Table.Tr key="approved">
            <Table.Td>Approved</Table.Td>
            <Table.Td>{props.domain.approval?.id}</Table.Td>
          </Table.Tr>
          <Table.Tr key="reverse">
            <Table.Td>Resolved Address</Table.Td>
            <Table.Td>{props.domain.resolvedAddress}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  );
}

function Transfer(props: { domain: Domain }) {
  const account = useAccount();
  const [address, setAddress] = useState("");
  const [isValidAddress, setValidAddress] = useState(true);

  const saveRecord = useWriteContract();

  function handleSaveRecord() {
    if (!account.address) {
      return;
    }
    if (!address || !isAddress(address)) {
      setValidAddress(false);
      return;
    }

    saveRecord.writeContract({
      abi: REGISTRY_ABI,
      address: props.domain.registry.address,
      functionName: "safeTransferFrom",
      args: [account.address!, address, BigInt(props.domain.id)],
    });
  }

  return (
    <Card>
      <Title order={4}>Transfer Domain</Title>
      <Space h="md" />
      <Group grow align="baseline">
        <TextInput
          placeholder="To"
          error={isValidAddress ? "" : "Invalid address"}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setValidAddress(true);
          }}
        />
        <Button loading={saveRecord.isPending} onClick={handleSaveRecord}>
          Transfer
        </Button>
      </Group>
    </Card>
  );
}

function Subdomain(props: { domain: Domain }) {
  const [name, setName] = useState<string>("");

  const register = useWriteContract();

  function handleRegisterSubdomain() {
    if (!name || register.isPending) {
      return;
    }

    register.writeContract({
      abi: REGISTRY_ABI,
      address: props.domain.registry.address,
      functionName: "registerSubdomain",
      args: [BigInt(props.domain.id), normalize(name)],
    });
  }

  return (
    <Card>
      <Title order={4}>Subdomains</Title>
      <Space h="md" />
      <Group grow align="baseline">
        <TextInput
          placeholder="To"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Button loading={register.isPending} onClick={handleRegisterSubdomain}>
          Register
        </Button>
      </Group>
    </Card>
  );
}
