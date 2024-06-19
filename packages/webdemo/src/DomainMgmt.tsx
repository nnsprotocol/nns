import { Button, Space, Table, TextInput, Title } from "@mantine/core";
import { Hash, namehash } from "viem";
import { useDomain } from "./services/graph";
import { useReadContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";

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

  const records = useReadContract({
    abi: REGISTRY_ABI,
    functionName: "recordsOf",
    address: domain.data?.registry.address,
    args: [BigInt(props.tokenId || 0n), [BigInt(RECORDS.CRYPTO_ETH.id)]],
    query: {
      select(data) {
        return [{ ...RECORDS.CRYPTO_ETH, value: data[0] }];
      },
    },
  });

  if (!domain.data) {
    return null;
  }

  return (
    <div>
      <Title order={1}>{domain.data?.name}</Title>
      <Space h="md" />
      <Table striped withTableBorder withColumnBorders>
        <Table.Tbody>
          <Table.Tr key="owner">
            <Table.Td>Owner</Table.Td>
            <Table.Td>{domain.data.owner.id}</Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
          <Table.Tr key="reverse">
            <Table.Td>Resolved Address</Table.Td>
            <Table.Td>
              <TextInput
                value={domain.data.resolvedAddress || ""}
                disabled
              ></TextInput>
            </Table.Td>
            <Table.Td>
              <Button>Clear</Button>
            </Table.Td>
          </Table.Tr>
          {records.data?.map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td>{r.name}</Table.Td>
              <Table.Td>
                <TextInput value={r.value} disabled></TextInput>
              </Table.Td>
              <Table.Td>
                <Button>Clear</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
