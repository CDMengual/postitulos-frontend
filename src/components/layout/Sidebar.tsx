"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Divider,
} from "@mui/material";
import { MenuOpen, ChevronRight } from "@mui/icons-material";
import Image from "next/image";
import { menuItems } from "@/constants/menu";
import { useUserContext } from "@/components/providers/UserProvider";

const drawerWidth = 240;
const collapsedWidth = 72;

export default function Sidebar() {
  const { user } = useUserContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const items = user
    ? menuItems.filter((item) => item.roles.includes(user.rol))
    : [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      {/* Header con logo y toggle */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          px: 2,
        }}
      >
        {open && (
          <Image
            src="/assets/logos/logo_pba.svg"
            alt="Logo PBA"
            width={120}
            height={40}
            priority
          />
        )}
        <IconButton onClick={() => setOpen((prev) => !prev)}>
          {open ? <MenuOpen /> : <ChevronRight />}
        </IconButton>
      </Toolbar>

      <Divider />

      <List>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                justifyContent: open ? "flex-start" : "center",
                px: open ? 2 : 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                <Icon fontSize="medium" />
              </ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
