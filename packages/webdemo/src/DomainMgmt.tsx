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
import { Hash, isAddress, namehash } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";
import { Domain, useDomain } from "./services/graph";
import { useState } from "react";

interface DomainMgmtProps {
  tokenId: Hash;
}

const RECORDS = {
  CRYPTO_ETH: {
    id: namehash("crypto.ETH.address"),
    name: "ETH Address",
  },
};

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
        <Records domain={domain.data} />
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

function Records(props: { domain: Domain }) {
  const records = useReadContract({
    abi: REGISTRY_ABI,
    functionName: "recordsOf",
    address: props.domain?.registry.address,
    args: [BigInt(props.domain.id || 0n), [BigInt(RECORDS.CRYPTO_ETH.id)]],
    query: {
      select(data) {
        return [{ ...RECORDS.CRYPTO_ETH, value: data[0] }];
      },
    },
  });

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
          {records.data?.map((r) => (
            <Table.Tr key={"record-" + r.id}>
              <Table.Td>{r.name}</Table.Td>
              <Table.Td>{r.value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
