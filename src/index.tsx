"use strict";

import jss from "jss";
import preset from "jss-preset-default";
import { Dom as dom } from "googlers-tools";
import { Icon, List, ListHeader, ListItem, ListTitle, Page, Splitter, SplitterContent, SplitterSide, Tab, Tabbar, TabbarRenderTab, Toolbar, ToolbarButton } from "react-onsenui";
import { Component, ReactNode } from "react";
// import jszip from "jszip";
// import { saveAs } from "file-saver";

// Styles
import theme from "./styles/theme";
import "./styles/default.scss";
import "onsenui/css/onsenui.css";
import BotaTab from "./tabs/BotaTab";
import drawerItems from "./util/drawerItems";

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

class App extends Component<Props, States> {
  public static displayName = "app";

  public constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      index: 0,
      isOpen: false,
    };

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.renderToolbar = this.renderToolbar.bind(this);
  }

  public componentDidMount(): void {
    jss.setup(preset());
    jss.createStyleSheet(theme).attach();
  }

  private renderToolbar(): JSX.Element {
    const titles = ["Encode", "Decode"];
    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClick={this.show}>
            <Icon icon="md-menu" />
          </ToolbarButton>
        </div>
        <div className="center">{titles[this.state.index]}</div>
      </Toolbar>
    );
  }

  private renderTabs(): TabbarRenderTab[] {
    return [
      {
        content: <BotaTab.Create method="encode" />,
        tab: <Tab label="Encode" />,
      },
      {
        content: <BotaTab.Create method="decode" />,
        tab: <Tab label="Decode" />,
      },
    ];
  }

  private hide(): void {
    this.setState({ isOpen: false });
  }

  private show(): void {
    this.setState({ isOpen: true });
  }

  public render(): ReactNode {
    const { isOpen } = this.state;

    return (
      <Splitter>
        <SplitterSide
          style={{
            boxShadow: isOpen ? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" : "none",
          }}
          side="left"
          width={300}
          collapse={true}
          swipeable={true}
          isOpen={this.state.isOpen}
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
                        <ListItem
                          key={`${item.title}_item`}
                          {...contentItem}
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
          <Page renderToolbar={this.renderToolbar}>
            <Tabbar
              swipeable={true}
              position="auto"
              index={this.state.index}
              onPreChange={(event: any): void => {
                if (event.index != this.state.index) {
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
