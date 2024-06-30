import {
  Button,
  Card,
  Group,
  Select,
  Space,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Hash, isAddress, namehash } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";
import { Domain, useDomain } from "./services/graph";

interface DomainMgmtProps {
  tokenId: Hash;
}

type DomainRecord = {
  id: Hash;
  name: string;
  type: "address";
};

type RecordType = "CRYPTO_ETH";

const RECORDS: Record<RecordType, DomainRecord> = {
  CRYPTO_ETH: {
    id: namehash("crypto.ETH.address"),
    name: "ETH Address",
    type: "address",
  },
};

export default function DomainMgmt(props: DomainMgmtProps) {
  const domain = useDomain({ id: props.tokenId });

  console.log("hash", namehash("crypto.ETH.address"));

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
        <EditRecords domain={domain.data} />
        <Transfer domain={domain.data} />
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

function EditRecords(props: { domain: Domain }) {
  const [record, setRecord] = useState<DomainRecord | null>(null);
  const [value, setValue] = useState("");

  const saveRecord = useWriteContract();

  function handleSaveRecord() {
    if (!record || !value) {
      return;
    }

    saveRecord.writeContract({
      abi: REGISTRY_ABI,
      address: props.domain.registry.address,
      functionName: "setRecord",
      args: [BigInt(props.domain.id), BigInt(record.id), value.toLowerCase()],
    });
  }

  return (
    <Card>
      <Title order={4}>Edit Record</Title>
      <Space h="md" />
      <Group align="end" grow>
        <Select
          required
          label="Community"
          name="registry"
          placeholder="Pick value"
          data={Object.values(RECORDS).map((r) => r.name)}
          value={Object.values(RECORDS).find((r) => r.id === record?.id)?.name}
          onChange={(name) => {
            const record = Object.values(RECORDS).find((r) => r.name === name);
            setRecord(record || null);
            setValue("");
          }}
        />
        <TextInput
          placeholder="Value"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <Button
          loading={saveRecord.isPending}
          disabled={!record || !value}
          onClick={handleSaveRecord}
        >
          Save
        </Button>
      </Group>
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
