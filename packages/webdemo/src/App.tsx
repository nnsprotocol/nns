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
import {
  Domain,
  Subdomain,
  useDomainOperators,
  useDomains,
} from "./services/graph";

import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  IconArrowBackUp,
  IconChevronRight,
  IconCrown,
  IconSquareRoundedPlus,
  IconMoneybag,
  IconArrowBadgeRight,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Address, isAddress, isAddressEqual, keccak256, toHex } from "viem";
import DomainMgmt from "./DomainMgmt";
import Register from "./Register";
import ReverseMgmt from "./ReverseMgmt";
import RewardMgmt from "./RewardMgmt";
import SubdomainMgmt from "./SubdomainMgmt";

type NavItem =
  | {
      type: "register";
    }
  | {
      type: "reverse";
    }
  | {
      type: "rewards";
    }
  | {
      type: "domain";
      domain: Domain;
    }
  | {
      type: "subdomain";
      subdomain: Subdomain;
    };

const badgeColor = (name: string) => {
  const hash = BigInt(keccak256(toHex(name.split(".")[1])));
  const colors = ["cyan", "teal", "lime", "orange", "indigo"];
  return colors[Number(hash % BigInt(colors.length))];
};

function getInitalNavItem(): NavItem {
  const stored = localStorage.getItem("nns:section");
  if (stored) {
    return JSON.parse(stored);
  }
  return { type: "rewards" };
}

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navItem, setNavItem] = useState<NavItem>(getInitalNavItem());
  const account = useAccount();
  const ownedDomains = useDomains({ owner: account.address });
  const domainOperators = useDomainOperators({ operator: account.address });
  const delegatedDomains = useDomains({
    delegatee: account.address,
    operators: domainOperators.data,
  });

  useEffect(() => {
    localStorage.setItem("nns:section", JSON.stringify(navItem));
  }, [navItem]);

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
        <NavLink
          label="Rewards"
          leftSection={<IconMoneybag size="1rem" stroke={1.5} />}
          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
          onClick={() => setNavItem({ type: "rewards" })}
          active={navItem?.type === "rewards"}
        />

        <Space h="md" />
        <Text fw={700}>Your Domains</Text>
        <Space h="sm" />
        {(ownedDomains.data || []).map((d) => (
          <>
            <DomainNavLink
              key={"owned-" + d.id}
              domain={d}
              account={account.address}
              onClick={() => setNavItem({ type: "domain", domain: d })}
              active={navItem.type === "domain" && navItem.domain.id === d.id}
            />
            {d.subdomains?.map((sub) => (
              <SubdomainNavLink
                key={"owned-" + sub.id}
                domain={sub}
                account={account.address}
                onClick={() =>
                  setNavItem({ type: "subdomain", subdomain: sub })
                }
                active={
                  navItem.type === "subdomain" &&
                  navItem.subdomain.id === sub.id
                }
              />
            ))}
          </>
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
        {navItem.type === "rewards" ? <RewardMgmt /> : null}
        {navItem.type === "domain" ? (
          <DomainMgmt tokenId={navItem.domain.id} />
        ) : null}
        {navItem.type === "subdomain" ? (
          <SubdomainMgmt id={navItem.subdomain.id} />
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

function SubdomainNavLink(props: {
  domain: Subdomain;
  account?: Address;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <NavLink
      pl={75}
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
      leftSection={<IconArrowBadgeRight size="0.8rem" stroke={1.5} />}
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
