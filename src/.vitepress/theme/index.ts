import type { Theme } from "vitepress";
import LinkedCard from "./components/LinkedCard.vue";
import LivePhoto from "./components/LivePhoto.vue";
import Layout from "./Layout.vue";
import "@bean-blog/lxgw-wenkai-lite-webfont";
import "./tailwind.css";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("LinkedCard", LinkedCard);
    app.component("LivePhoto", LivePhoto);
  },
} satisfies Theme;
