import { DrawerListItems } from "..";

const drawerItems: DrawerListItems[] = [
  {
    title: "GitHub",
    content: [
      {
        children: "Bota64 Library",
        tappable: true,
        modifier: "chevron",
        onClick<T>(hide: () => void, event: T) {
          window.open("https://github.com/DerGoogler/Bota64", "_blank");
          hide();
        },
      },
      {
        children: "Bota64 App Issues",
        tappable: true,
        modifier: "chevron",
        onClick<T>(hide: () => void, event: T) {
          window.open("https://github.com/DerGoogler/Bota64-App/issues", "_blank");
          hide();
        },
      },
      {
        children: "React OnsenUiX",
        tappable: true,
        modifier: "chevron",
        onClick<T>(hide: () => void, event: T) {
          window.open("https://github.com/DerGoogler/react-onsenuix", "_blank");
          hide();
        },
      },
    ],
  },
];

export default drawerItems;
