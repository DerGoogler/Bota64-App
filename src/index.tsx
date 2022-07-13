"use strict";

import jss from "jss";
import preset from "jss-preset-default";
import { dom } from "googlers-tools";
import { ListHeader, Splitter, SplitterContent, SplitterSide } from "react-onsenui";
import { List, Page, Toolbar, Icon, ActivityX, ActivityXRenderData, BottomToolbar, TabbarRenderTab, Tab, Tabbar, TabbarEvent } from "react-onsenuix";
import BotaTab from "./tabs/BotaTab";
import drawerItems from "./util/drawerItems";
import { isFirefox } from "react-device-detect";
import { Property } from "csstype";

// Styles
import theme from "./styles/theme";
import "./styles/default.scss";
import "onsenui/css/onsenui.css";

interface States {
  index: number;
  isOpen: boolean;
}

interface Props {}

interface DrawerListItemsContent extends DrawerListItemsContentSeperate {
  children?: React.ReactNode;
  modifier?: string | undefined;
  tappable?: boolean | undefined;
  tapBackgroundColor?: string | undefined;
  lockOnDrag?: boolean | undefined;
  expandable?: boolean | undefined;
  expanded?: boolean | undefined;
}

interface DrawerListItemsContentSeperate {
  onClick?: <T = Element>(hide: () => void, event: React.MouseEvent<T, MouseEvent>) => void | undefined;
}

export interface DrawerListItems {
  title: string;
  content: DrawerListItemsContent[];
}

class App extends ActivityX<Props, States> {
  public static displayName: string = "app";
  public static useContentBody: boolean = true;

  public constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      index: 0,
      isOpen: false,
    };

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.onCreate = this.onCreate.bind(this);
  }

  public componentDidMount(): void {
    jss.setup(preset());
    jss.createStyleSheet(theme).attach();
  }

  private renderToolbar(): JSX.Element {
    const titles = ["Encode", "Decode"];
    return (
      <Toolbar>
        <Toolbar.Left>
          <Toolbar.Button onClick={this.show}>
            <Icon icon="md-menu" />
          </Toolbar.Button>
        </Toolbar.Left>
        <Toolbar.Center>{titles[this.state.index]}</Toolbar.Center>
      </Toolbar>
    );
  }

  private renderTabs(): TabbarRenderTab[] {
    return [
      {
        content: <BotaTab.Create method="encode" />,
        tab: <Tab label="Encode" icon="md-lock" />,
      },
      {
        content: <BotaTab.Create method="decode" />,
        tab: <Tab label="Decode" icon="md-lock-open" />,
      },
    ];
  }

  private hide(): void {
    this.setState({ isOpen: false });
  }

  private show(): void {
    this.setState({ isOpen: true });
  }

  public onCreate(d: ActivityXRenderData<Props, States>): JSX.Element {
    return (
      <Splitter>
        <SplitterSide
          style={{
            boxShadow: d.s.isOpen ? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" : "none",
          }}
          side="left"
          width={300}
          collapse={true}
          swipeable={true}
          isOpen={d.s.isOpen}
          onClose={this.hide}
          onOpen={this.show}
        >
          <Page>
            <div
              style={{
                textAlign: "center",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#4a148c",
                boxShadow: "0 1px 6px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                style={{
                  width: "130px",
                  height: "130px",
                  border: "2px solid #fff",
                  margin: "8px 8px 0px 8px",
                  borderRadius: "25px",
                }}
                src="https://avatars.githubusercontent.com/u/104309259?s=200&v=4"
              />
              <h3 style={{ color: "white" }}>Bota64</h3>
            </div>
            <List
              dataSource={drawerItems}
              renderRow={(item: DrawerListItems): JSX.Element => (
                <>
                  <ListHeader key={item.title}>{item.title}</ListHeader>
                  {item.content.map(
                    (contentItem: DrawerListItemsContent): JSX.Element => (
                      <>
                        <List.Item
                          key={`${item.title}_item`}
                          {...contentItem}
                          // @ts-ignore
                          onClick={(event: React.MouseEvent<any, MouseEvent>) => {
                            contentItem.onClick!(this.hide, event);
                          }}
                        />
                      </>
                    )
                  )}
                </>
              )}
            />
          </Page>
        </SplitterSide>
        <SplitterContent>
          <Page
            renderToolbar={this.renderToolbar}
            renderBottomToolbar={() => {
              const mozPreSpace = isFirefox ? ("-moz-pre-space" as Property.WhiteSpace) : "break-spaces";
              return (
                <BottomToolbar
                  style={{ backgroundImage: "none", backgroundColor: "transparent", display: "flex", alignItems: "center", whiteSpace: mozPreSpace, justifyContent: "center", color: "#4a148c" }}
                >
                  {"Made with "}
                  <Icon icon="md-favorite" />
                  {" by"}
                  <a
                    href="https://dergoogler.com"
                    style={{
                      backgroundColor: "transparent",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    {" Der_Googler"}
                  </a>
                </BottomToolbar>
              );
            }}
          >
            <Tabbar
              swipeable={true}
              position="auto"
              index={d.s.index}
              onPreChange={(event: TabbarEvent): void => {
                if (event.index != d.s.index) {
                  this.setState({ index: event.index });
                }
              }}
              renderTabs={this.renderTabs}
            />
          </Page>
        </SplitterContent>
      </Splitter>
    );
  }
}

dom.preventer(["contextmenu"]);
dom.renderAuto(App);
