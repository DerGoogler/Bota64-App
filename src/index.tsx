"use strict";

import jss from "jss";
import preset from "jss-preset-default";
import { Dom as dom } from "googlers-tools";
import { Icon, List, ListItem, Page, Splitter, SplitterContent, SplitterSide, Tab, Tabbar, TabbarRenderTab, Toolbar, ToolbarButton } from "react-onsenui";
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

export interface DrawerListItems {
  title: string;
  onClick: (hide: () => void) => void;
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
          width={200}
          collapse={true}
          swipeable={true}
          isOpen={this.state.isOpen}
          onClose={this.hide}
          onOpen={this.show}
        >
          <Page>
            <List
              dataSource={drawerItems}
              renderRow={(item: DrawerListItems): JSX.Element => (
                <ListItem
                  key={item.title}
                  onClick={() => {
                    item.onClick(this.hide);
                  }}
                  tappable
                >
                  {item.title}
                </ListItem>
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
