import {
  Anchor,
  AppShell,
  Badge,
  Burger,
  Button,
  Flex,
  Group,
  NavLink,
  Select,
  Space,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";

import { useAccount, useWriteContract } from "wagmi";
import { Registry, useDomains, useRegistries } from "./services/graph";

import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IconChevronRight, IconSquareRoundedPlus } from "@tabler/icons-react";
import { FormEvent, useState } from "react";
import { formatUnits, keccak256, toHex } from "viem";
import CONTROLLER_ABI from "./services/abi/IController";
import { CONTROLLER_ADDRESS, useDomainPrice } from "./services/controller";

type NavItem = "register" | bigint;

const badgeColor = (name: string) => {
  const hash = BigInt(keccak256(toHex(name.split(".")[1])));
  const colors = ["cyan", "teal", "lime", "orange", "indigo"];
  return colors[Number(hash % BigInt(colors.length))];
};

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navItem, setNavItem] = useState<NavItem | null>("register");
  const account = useAccount();
  const domains = useDomains({ owner: account.address });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          NNS v2
          <Space />
          <ConnectButton />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          label="Register"
          leftSection={<IconSquareRoundedPlus size="1rem" stroke={1.5} />}
          rightSection={
            <IconChevronRight
              size="0.8rem"
              stroke={1.5}
              className="mantine-rotate-rtl"
            />
          }
          onClick={() => setNavItem("register")}
          active={navItem === "register"}
        />

        <Space h="md" />
        <Text fw={700}>Your Domains</Text>
        <Space h="sm" />
        {domains.data?.map((d) => (
          <NavLink
            label={d.name}
            leftSection={
              <Badge color={badgeColor(d.name)} size="xs">
                {"." + d.name.split(".")[1]}
              </Badge>
            }
            rightSection={
              <IconChevronRight
                size="0.8rem"
                stroke={1.5}
                className="mantine-rotate-rtl"
              />
            }
            onClick={() => setNavItem(BigInt(d.id))}
            active={navItem === BigInt(d.id)}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        {navItem === "register" ? <Register /> : null}
      </AppShell.Main>
    </AppShell>
  );
}

function Register() {
  const registries = useRegistries();
  const [name, setName] = useState("");
  const [registry, setRegistry] = useState<Registry | null>(null);
  const account = useAccount();

  const price = useDomainPrice({
    cldId: registry?.id,
    name,
  });

  const register = useWriteContract();
  function handleSubmit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    if (
      !registry ||
      !name ||
      register.isPending ||
      !account.address ||
      !price
    ) {
      return;
    }

    register.writeContract({
      abi: CONTROLLER_ABI,
      address: CONTROLLER_ADDRESS,
      functionName: "register",
      value: (price.eth * 11n) / 10n,
      args: [
        account.address,
        [name, registry.name],
        true,
        "0x0000000000000000000000000000000000000000",
        0,
      ],
    });
  }

  return (
    <Flex direction="column" mih={50}>
      <form onSubmit={handleSubmit}>
        <Flex
          mih={50}
          justify="flex-start"
          align="flex-start"
          direction="row"
          wrap="wrap"
        >
          <TextInput
            required
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          .
          <Select
            required
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
          <Button loading={register.isPending} type="submit">
            Register
          </Button>
        </Flex>
      </form>
      {price && <Text size="xl">Price: ${formatUnits(price.usd, 18)}</Text>}
      {register.data && (
        <Anchor href={`https://sepolia.basescan.org/tx/${register.data}`}>
          View Tx
        </Anchor>
      )}
      <Domains />
    </Flex>
  );
}

function Domains() {
  const account = useAccount();
  const domains = useDomains({ owner: account.address });

  const rows = domains.data?.map((d) => (
    <Table.Tr key={d.id}>
      <Table.Td>{d.name}</Table.Td>
      <Table.Td>{d.resolvedAddress || "none"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Reverse</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export default App;
