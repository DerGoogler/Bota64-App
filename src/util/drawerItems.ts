import { DrawerListItems } from "..";

const drawerItems: DrawerListItems[] = [
  {
    title: "Bota64 Library",
    onClick(hide) {
      window.open("https://github.com/DerGoogler/Bota64", "_blank");
      hide();
    },
  },
  {
    title: "Bota64 App Issues",
    onClick(hide) {
      window.open("https://github.com/DerGoogler/Bota64-App/issues", "_blank");
      hide();
    },
  },
];

export default drawerItems;
