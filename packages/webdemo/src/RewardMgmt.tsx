import {
  Button,
  Card,
  Group,
  MultiSelect,
  Select,
  Space,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { formatEther, namehash } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import rewarderABI from "./services/abi/IRewarder";
import { Domain, useDomains } from "./services/graph";
import { REWARDER_ADDRESS } from "./services/rewarder";

export default function RewardMgmt() {
  return (
    <>
      <Snapshot />
      <Withdraw />
    </>
  );
}

function Snapshot() {
  const snapshot = useReadContract({
    abi: rewarderABI,
    address: REWARDER_ADDRESS,
    functionName: "holderRewardsSnapshot",
  });
  const takeSnapshot = useWriteContract({
    mutation: {
      onSuccess: () => {
        setTimeout(() => {
          snapshot.refetch();
        }, 2000);
      },
    },
  });

  if (!snapshot.data) {
    return "";
  }

  function handleTakeSnapshot() {
    if (takeSnapshot.isPending) {
      return;
    }

    takeSnapshot.writeContract({
      abi: rewarderABI,
      address: REWARDER_ADDRESS,
      functionName: "takeHolderRewardsSnapshot",
    });
  }

  return (
    <Card>
      <Title order={4}>Snapshot</Title>
      <Space h="md" />
      <Table striped withTableBorder withColumnBorders>
        <Table.Tbody>
          <Table.Tr key="supply">
            <Table.Td>Number of .⌐◨-◨</Table.Td>
            <Table.Td>{snapshot.data.supply.toString(10)}</Table.Td>
          </Table.Tr>
          <Table.Tr key="reward">
            <Table.Td>Reward per .⌐◨-◨</Table.Td>
            <Table.Td>{formatEther(snapshot.data.reward || 0n)} $NOGS</Table.Td>
          </Table.Tr>
          <Table.Tr key="unclaimed">
            <Table.Td>Unclaimed</Table.Td>
            <Table.Td>
              {formatEther(snapshot.data.unclaimed || 0n)} $NOGS
            </Table.Td>
          </Table.Tr>
          <Table.Tr key="blocknum">
            <Table.Td>Block Number</Table.Td>
            <Table.Td>{snapshot.data.blockNumber.toString(10)}</Table.Td>
          </Table.Tr>
          <Table.Tr key="blocktimestamp">
            <Table.Td>Block Date</Table.Td>
            <Table.Td>
              {new Date(Number(snapshot.data.blockTimestamp)).toLocaleString()}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <Space h="md" />
      <Button onClick={handleTakeSnapshot} loading={takeSnapshot.isPending}>
        Take snapshot
      </Button>
    </Card>
  );
}

function Withdraw() {
  const account = useAccount();
  const allDomains = useDomains({
    owner: account.address,
  });
  const nogsDomains = useMemo(() => {
    return allDomains.data?.filter(
      (d) => d.registry.id === namehash("⌐◨-◨").toLowerCase()
    );
  }, [allDomains.data]);
  const walletBalance = useReadContract({
    abi: rewarderABI,
    address: REWARDER_ADDRESS,
    functionName: "balanceOf",
    args: [account.address || "0x"],
    query: {
      enabled: Boolean(account.address),
    },
  });

  const [rewardCheckDomain, setRewardCheckDomain] = useState<Domain | null>(
    null
  );
  const domainBalance = useReadContract({
    abi: rewarderABI,
    address: REWARDER_ADDRESS,
    functionName: "balanceOf",
    args: [BigInt(rewardCheckDomain?.id || 0n)],
    query: {
      enabled: Boolean(rewardCheckDomain),
    },
  });

  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const claim = useWriteContract();

  function handleClaim() {
    if (claim.isPending || selectedDomains.length === 0) {
      return;
    }
    claim.writeContract({
      abi: rewarderABI,
      address: REWARDER_ADDRESS,
      functionName: "withdraw",
      args: [account.address || "0x", selectedDomains.map((d) => BigInt(d.id))],
    });
  }

  return (
    <Card>
      <Title order={4}>Claim Rewards</Title>
      <Space h="md" />
      <Stack>
        <Group grow align="end">
          <Select
            label="Select domain to see balance"
            data={nogsDomains?.map((d) => d.name) || []}
            value={rewardCheckDomain?.name || ""}
            onChange={(value) => {
              setRewardCheckDomain(
                nogsDomains?.find((d) => d.name === value) || null
              );
            }}
          />
          <TextInput
            label={`Balance for ${rewardCheckDomain?.name || ""}`}
            disabled
            value={formatEther(domainBalance.data || 0n)}
          />
        </Group>
        <Group grow align="end">
          <MultiSelect
            label="Select domains"
            data={nogsDomains?.map((d) => d.name) || []}
            value={selectedDomains.map((d) => d.name)}
            onChange={(values) => {
              setSelectedDomains(
                nogsDomains?.filter((d) => values.includes(d.name)) || []
              );
            }}
          />
          <TextInput
            label="Wallet Balance"
            disabled
            value={formatEther(walletBalance.data || 0n)}
          />
          <Button loading={claim.isPending} onClick={handleClaim}>
            Claim
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
