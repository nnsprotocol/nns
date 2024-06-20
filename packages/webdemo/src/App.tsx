import {
  AppShell,
  Badge,
  Burger,
  Group,
  NavLink,
  Space,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";

import { useAccount } from "wagmi";
import { Domain, useDomains } from "./services/graph";

import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  IconArrowBackUp,
  IconChevronRight,
  IconCrown,
  IconSquareRoundedPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { Address, isAddress, isAddressEqual, keccak256, toHex } from "viem";
import DomainMgmt from "./DomainMgmt";
import Register from "./Register";
import ReverseMgmt from "./ReverseMgmt";

type NavItem =
  | {
      type: "register";
    }
  | {
      type: "reverse";
    }
  | {
      type: "domain";
      domain: Domain;
    };

const badgeColor = (name: string) => {
  const hash = BigInt(keccak256(toHex(name.split(".")[1])));
  const colors = ["cyan", "teal", "lime", "orange", "indigo"];
  return colors[Number(hash % BigInt(colors.length))];
};

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navItem, setNavItem] = useState<NavItem>({ type: "reverse" });
  const account = useAccount();
  const ownedDomains = useDomains({ owner: account.address });
  const delegatedDomains = useDomains({ delegatee: account.address });

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
          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
          onClick={() => setNavItem({ type: "register" })}
          active={navItem?.type === "register"}
        />
        <NavLink
          label="Reverse"
          leftSection={<IconArrowBackUp size="1rem" stroke={1.5} />}
          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
          onClick={() => setNavItem({ type: "reverse" })}
          active={navItem?.type === "reverse"}
        />

        <Space h="md" />
        <Text fw={700}>Your Domains</Text>
        <Space h="sm" />
        {(ownedDomains.data || []).map((d) => (
          <DomainNavLink
            key={"owned-" + d.id}
            domain={d}
            account={account.address}
            onClick={() => setNavItem({ type: "domain", domain: d })}
            active={navItem.type === "domain" && navItem.domain.id === d.id}
          />
        ))}
        <Space h="sm" />
        <Text fw={700}>Delegated Domains</Text>
        <Space h="sm" />
        {(delegatedDomains.data || []).map((d) => (
          <DomainNavLink
            key={"delegated-" + d.id}
            domain={d}
            account={account.address}
            onClick={() => setNavItem({ type: "domain", domain: d })}
            active={navItem.type === "domain" && navItem.domain.id === d.id}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        {navItem.type === "register" ? <Register /> : null}
        {navItem.type === "reverse" ? <ReverseMgmt /> : null}
        {navItem.type === "domain" ? (
          <DomainMgmt tokenId={navItem.domain.id} />
        ) : null}
      </AppShell.Main>
    </AppShell>
  );
}

function DomainNavLink(props: {
  domain: Domain;
  account?: Address;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <NavLink
      label={
        <Group>
          {props.domain.name}
          {isAddress(props.domain.resolvedAddress || "") &&
            props.account &&
            isAddressEqual(props.domain.resolvedAddress!, props.account) && (
              <IconCrown stroke={1.5} color="gold" />
            )}
        </Group>
      }
      leftSection={
        <Badge color={badgeColor(props.domain.name)} size="xs">
          {"." + props.domain.name.split(".")[1]}
        </Badge>
      }
      rightSection={
        <IconChevronRight
          size="0.8rem"
          stroke={1.5}
          className="mantine-rotate-rtl"
        />
      }
      onClick={props.onClick}
      active={props.active}
    />
  );
}

export default App;
