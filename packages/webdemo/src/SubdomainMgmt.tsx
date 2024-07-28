import { Button, Card, Group, Space, Stack, Title } from "@mantine/core";
import { Hash } from "viem";
import { Subdomain, useSubdomain } from "./services/graph";
import Records from "./Records";
import { useWriteContract } from "wagmi";
import REGISTRY_ABI from "./services/abi/IRegistry";

interface SubdomainMgmtProps {
  id: Hash;
}

export default function SubdomainMgmt(props: SubdomainMgmtProps) {
  const sub = useSubdomain({ id: props.id });

  if (!sub.data) {
    return null;
  }

  return (
    <div>
      <Title order={1}>{`${sub.data.name}.${sub.data.parent.name}`}</Title>
      <Space h="md" />
      <Stack>
        <Records
          registry={sub.data.parent.registry.address}
          tokenId={sub.data.id}
        />
        <Delete sub={sub.data} />
      </Stack>
    </div>
  );
}

function Delete(props: { sub: Subdomain }) {
  const deleteSub = useWriteContract();

  function handleDelete() {
    if (deleteSub.isPending) {
      return;
    }

    deleteSub.writeContract({
      abi: REGISTRY_ABI,
      functionName: "deleteSubdomain",
      args: [BigInt(props.sub.id)],
      address: props.sub.parent.registry.address,
    });
  }

  return (
    <Card>
      <Title order={4}>Delete</Title>
      <Space h="md" />
      <Group align="end" grow>
        <Button
          color="red"
          onClick={handleDelete}
          loading={deleteSub.isPending}
        >
          Delete
        </Button>
      </Group>
    </Card>
  );
}
