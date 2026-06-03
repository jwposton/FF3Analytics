import {
  BarChart3,
  GitBranch,
  LayoutDashboard,
  Table,
  TrendingUp,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    to: "/reports/transactions",
    label: "Transaction Explorer",
    icon: Table,
    end: false,
  },
  {
    to: "/reports/trends",
    label: "Spending Trends",
    icon: TrendingUp,
    end: false,
  },
  {
    to: "/reports/bar",
    label: "Bar & Drilldown",
    icon: BarChart3,
    end: false,
  },
  {
    to: "/reports/sankey",
    label: "Sankey Flows",
    icon: GitBranch,
    end: false,
  },
] as const

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center px-2 font-semibold tracking-tight group-data-[collapsible=icon]:justify-center">
          <span className="truncate group-data-[collapsible=icon]:hidden">
            FF3Analytics
          </span>
          <span className="hidden text-xs font-semibold group-data-[collapsible=icon]:inline">
            FF3
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent font-medium" : undefined
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
