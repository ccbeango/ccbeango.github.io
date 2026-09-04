import type { Theme } from "vitepress";
import LinkedCard from "./components/LinkedCard.vue";
import LivePhoto from "./components/LivePhoto.vue";
import MusicCard from "./components/MusicCard.vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import Layout from "./Layout.vue";
import "@bean-blog/lxgw-wenkai-lite-webfont";
import "./tailwind.css";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("LinkedCard", LinkedCard);
    app.component("LivePhoto", LivePhoto);
    app.component("MusicCard", MusicCard);
    app.component("VideoPlayer", VideoPlayer);
  },
} satisfies Theme;
