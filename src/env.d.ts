/// <reference types="vitepress/client" />

declare module "markdown-it-mathjax3";
declare module "markdown-it-task-lists";

declare module "vitepress/dist/client/theme-default/composables/layout.js" {
  import type { DefaultTheme } from "vitepress/theme";
  import type { ComputedRef, ShallowRef } from "vue";

  export function useLayout(): {
    isHome: ComputedRef<boolean>;
    sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>;
    sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>;
    hasSidebar: ComputedRef<boolean>;
    isSidebarEnabled: ComputedRef<boolean>;
    hasAside: ComputedRef<boolean>;
    leftAside: ComputedRef<boolean>;
    headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>;
    hasLocalNav: ComputedRef<boolean>;
  };

  export function registerWatchers(options: { closeSidebar: () => void }): void;
}

declare module "vitepress/dist/client/theme-default/composables/outline.js" {
  import type { DefaultTheme } from "vitepress/theme";
  import type { Ref } from "vue";

  export function getHeaders(
    range?: DefaultTheme.Outline | DefaultTheme.Outline["level"] | false,
  ): DefaultTheme.OutlineItem[];
  export function useActiveAnchor(container: Ref<HTMLElement | undefined>, marker: Ref<HTMLElement | undefined>): void;
}

declare module "vitepress/dist/client/theme-default/composables/sidebar.js" {
  import type { DefaultTheme } from "vitepress/theme";
  import type { ComputedRef, Ref } from "vue";

  export function useSidebarControl(): {
    isOpen: Ref<boolean>;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };

  export function useSidebarItemControl(item: Readonly<Ref<DefaultTheme.SidebarItem>>): {
    collapsed: Ref<boolean>;
    collapsible: ComputedRef<boolean>;
    isLink: ComputedRef<boolean>;
    isActiveLink: Ref<boolean>;
    hasActiveLink: Ref<boolean>;
    hasChildren: ComputedRef<boolean>;
    toggle: () => void;
  };
}
