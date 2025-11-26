"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useLoading } from "@/components/providers/LoadingProvider";

const drawerWidth = 240;
const collapsedWidth = 72;

export default function Sidebar() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { user } = useUserContext();
  const { open, toggle } = useSidebar();
  const pathname = usePathname();

  const items = user
    ? menuItems.filter((item) => item.roles.includes(user.rol))
    : [];

  const handleNavigation = async (path: string) => {
    setLoading(true);
    router.push(path);
  };

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
        <IconButton onClick={toggle}>
          {open ? <MenuOpen /> : <ChevronRight />}
        </IconButton>
      </Toolbar>

      <Divider />

      <List>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={selected}
              sx={{
                justifyContent: open ? "center" : "center",
                px: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <Icon fontSize="medium" />
              </ListItemIcon>
              {open && <ListItemText primary={item.label} sx={{ m: 0 }} />}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
