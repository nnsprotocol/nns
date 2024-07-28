import { Button, Card, Group, Space, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { Address, Hash, namehash } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";

type DomainRecord = {
  id: Hash;
  name: string;
  type: "address";
};

type RecordType = "CRYPTO_ETH";

export const RECORDS: Record<RecordType, DomainRecord> = {
  CRYPTO_ETH: {
    id: namehash("crypto.ETH.address"),
    name: "ETH Address",
    type: "address",
  },
};

interface EditRecordsProps {
  tokenId: Hash;
  registry: Address;
}

export default function Records(props: EditRecordsProps) {
  const ethRecord = useReadContract({
    abi: REGISTRY_ABI,
    functionName: "recordOf",
    address: props.registry,
    args: [BigInt(props.tokenId), BigInt(RECORDS.CRYPTO_ETH.id)],
  });

  const [value, setValue] = useState<string>("");
  useEffect(() => {
    if (!value) {
      setValue(ethRecord.data || "");
    }
  }, [ethRecord.data]);

  const saveRecord = useWriteContract();

  function handleSaveRecord() {
    if (!value) {
      return;
    }

    saveRecord.writeContract({
      abi: REGISTRY_ABI,
      address: props.registry,
      functionName: "setRecord",
      args: [BigInt(props.tokenId), BigInt(RECORDS.CRYPTO_ETH.id), value],
    });
  }

  return (
    <Card>
      <Title order={4}>Records</Title>
      <Space h="md" />
      <Group align="end" grow>
        <TextInput value={RECORDS.CRYPTO_ETH.name} disabled />
        <TextInput
          placeholder="Value"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <Button
          loading={saveRecord.isPending}
          disabled={!value}
          onClick={handleSaveRecord}
        >
          Save
        </Button>
      </Group>
    </Card>
  );
}
