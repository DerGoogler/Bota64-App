import { Component, ReactNode } from "react";
import { Button, Card, Icon, Page } from "react-onsenui";
import Bota64 from "bota64";
import ons from "onsenui";
import permission from "../util/permission";
import { isFirefox } from "react-device-detect";

namespace BotaTab {
  export interface States {
    input: string;
    output: string;
    clipboardState: string;
  }

  export interface Props {
    method: "encode" | "decode";
  }

  export class Create extends Component<Props, States> {
    private bota: Bota64;
    private method: "encode" | "decode";

    public constructor(props: Props | Readonly<Props>) {
      super(props);

      this.method = props.method;

      this.state = {
        input: "",
        output: "Empty",
        clipboardState: "",
      };

      this.bota = new Bota64();

      this.handleInput = this.handleInput.bind(this);
      this.handleCopy = this.handleCopy.bind(this);
      this.handleFunction = this.handleFunction.bind(this);
    }

    private get methodF(): "encode" | "decode" | string {
      return this.method.charAt(0).toUpperCase() + this.method.slice(1);
    }

    public componentDidMount(): void {
      if (isFirefox && !Number(localStorage.getItem("use_firefox"))) {
        ons.notification.confirm("Looks like you using Firefox, please remember that the Bota64 App in Firefox browser won't support coping to clipboard.").then((g) => {
          localStorage.setItem("use_firefox", String(g));
        });
      } else {
        permission("clipboard-write").then((status: PermissionStatus) => {
          this.setState({ clipboardState: status.state });
        });
      }
    }

    public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<States>, snapshot?: any): void {
      if (!isFirefox) {
        console.log(this.state.clipboardState);
      }
    }

    private handleFunction(): void {
      const { input } = this.state;
      if (input != "") {
        const work = this.bota[this.method](input);
        this.setState({ output: work });
      } else {
        ons.notification.toast(`You can't ${this.method} empty inputs`, { timeout: 1000, animation: "fall" });
      }
    }

    private handleInput(event: React.ChangeEvent<any>): void {
      this.setState({ input: event.target.value });
    }

    private handleCopy(): void {
      const { output } = this.state;
      if (!isFirefox) {
        if (output != "Empty") {
          navigator.clipboard.writeText(output);
        } else {
          ons.notification.toast("Seems that you dosen't have any output", { timeout: 1000, animation: "fall" });
        }
      } else {
        ons.notification.toast("We don't offer coping in Firefox", { timeout: 1000, animation: "fall" });
      }
    }

    public render(): ReactNode {
      const { input, output } = this.state;

      return (
        <Page>
          <section style={{ margin: "8px" }}>
            <p>
              <textarea
                className="textarea textarea--transparent"
                rows={3}
                value={input}
                placeholder={`Your text to ${this.method}`}
                onChange={this.handleInput}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  padding: "8px",
                  border: "solid #dbdbdb 1px",
                }}
              ></textarea>
            </p>
            <div style={{ display: "flex", width: "100%" }}>
              <Button modifier="large" onClick={this.handleFunction} style={{ marginRight: "4px" }}>
                {this.methodF} <Icon icon="md-lock" />
              </Button>
              <Button modifier="large" onClick={this.handleCopy} disabled={isFirefox} style={{ marginLeft: "4px" }}>
                Copy <Icon icon="md-copy" />
              </Button>
            </div>
          </section>
          <Card>
            <div className="title right">Output</div>
            <div className="content">
              <span>{output}</span>
            </div>
          </Card>
        </Page>
      );
    }
  }
}

export default BotaTab;