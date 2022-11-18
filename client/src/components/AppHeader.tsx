import { useState } from "react";
import {
  createStyles,
  Header,
  Group,
  ActionIcon,
  Container,
  Burger,
} from "@mantine/core";

import { Text } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { IconBrandTwitter, IconBrandYoutube, IconCamera } from "@tabler/icons";
import { Link, useLocation, useMatch } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  inner: {
    background: "brand",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,

    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  links: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  social: {
    width: 260,

    [theme.fn.smallerThan("sm")]: {
      width: "auto",
      marginLeft: "auto",
    },
  },

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      color: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor[1],
      }).color,
    },
  },
}));

interface Link {
  link: string;
  label: string;
}

const links: Array<Link> = [
  { link: "/auth", label: "Authenticate" },
  { link: "/register", label: "Sign up" },
  { link: "/admin", label: "Admin View" },
  { link: "/docs", label: "Docs" },
];

export default function HeaderMiddle() {
  const { pathname } = useLocation();
  const { classes, cx } = useStyles();

  const items = links.map((link) => (
    <Link
      to={link.link}
      key={link.link}
      className={
        "-translate-x-32 " +
        cx(classes.link, {
          [classes.linkActive]: link.link === pathname,
        })
      }
    >
      {link.label}
    </Link>
  ));

  return (
    <Header height={56} mb={120}>
      <Container fluid bg="primary" className={classes.inner}>
        <ActionIcon size="lg" color="brand">
          <IconCamera size={25} stroke={1.5} />
        </ActionIcon>
        <Text fz="md" className="mx-10">
          Face Recognition app
        </Text>

        <Group className={classes.links} spacing={5}>
          {items}
        </Group>

        {/*  <Group spacing={0} className={classes.social} position="right" noWrap>
          <ActionIcon size="lg">
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg">
            <IconBrandYoutube size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg">
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group> */}
      </Container>
    </Header>
  );
}
