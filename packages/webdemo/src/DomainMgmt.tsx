import { Space, Table, Title } from "@mantine/core";
import { Hash } from "viem";
import { useDomain } from "./services/graph";

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
      <Table striped withTableBorder withColumnBorders>
        <Table.Tbody>
          <Table.Tr key="owner">
            <Table.Td>Owner</Table.Td>
            <Table.Td>{domain.data.owner.id}</Table.Td>
          </Table.Tr>
          <Table.Tr key="reverse">
            <Table.Td>Resolved Address</Table.Td>
            <Table.Td>{domain.data.resolvedAddress}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </div>
  );
}
