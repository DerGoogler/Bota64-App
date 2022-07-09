import { Component, ReactNode } from "react";
import { Button, Card, Icon, Page, Ripple } from "react-onsenui";
import Bota64 from "bota64";
import ons from "onsenui";
import permission from "../util/permission";
import { isFirefox } from "react-device-detect";
import saveAs from "file-saver";
import chooseFile from "../util/chooseFile";
import pkg from "./../../package.json";

namespace BotaTab {
  export interface States {
    input: string;
    output: string;
    clipboardState: string;
  }

  export interface Props {
    method: "encode" | "decode";
  }

  interface FILE_META {
    meta: {
      date: string;
      usedBota64: boolean;
      version: {
        app: string;
        lib: string;
      };
    };
    file: {
      name: string;
      extension: string;
      originalName: string;
      outputName: string;
    };
    content: string;
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

      this.handleFileChange = this.handleFileChange.bind(this);
      this.handleInput = this.handleInput.bind(this);
      this.handleCopy = this.handleCopy.bind(this);
      this.handleFunction = this.handleFunction.bind(this);
    }

    private get methodF(): "encode" | "decode" | string {
      return this.method.charAt(0).toUpperCase() + this.method.slice(1);
    }

    private getFileExtension(name: string): string {
      return name.slice((Math.max(0, name.lastIndexOf(".")) || Infinity) + 1);
    }

    private isJsonString(str: string): boolean {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
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

    private handleFileChange(event: React.ChangeEvent<any>): void {
      chooseFile(event, (event: any, file: any, input: any) => {
        try {
          // Keep that for debugging purposes
          // console.log(input.files[0].name);
          // console.log(event.target.result);
          // console.log(this.bota[this.method](event.target.result));

          if (this.method === "decode") {
            const ctnt: FILE_META = JSON.parse(event.target.result);
            if (ctnt.meta.usedBota64) {
              const blob = new Blob([this.bota.decode(ctnt.content)], { type: "text/plain;charset=utf-8" });
              saveAs(blob, ctnt.file.originalName);
            } else {
              ons.notification.alert("File isn't an Bota64 file");
            }
          } else {
            const _P: FILE_META = this.isJsonString(event.target.result)
              ? JSON.parse(event.target.result)
              : {
                  meta: {
                    usedBota64: false,
                  },
                  content: event.target.result,
                };
            const d = () => ons.notification.alert("Re-encoding isn't allowed!");
            if (_P.meta.usedBota64) {
              d();
            } else {
              if (this.getFileExtension(input.files[0].name) != "bota64") {
                const content: FILE_META = {
                  meta: {
                    date: new Date().toString(),
                    usedBota64: true,
                    version: {
                      app: pkg.version,
                      lib: this.bota.version,
                    },
                  },
                  file: {
                    name: input.files[0].name.replace(/\.[^/.]+$/, ""),
                    extension: this.getFileExtension(input.files[0].name),
                    originalName: input.files[0].name,
                    outputName: `${input.files[0].name.replace(/\.[^/.]+$/, "")}.bota64`,
                  },
                  content: this.bota.encode(event.target.result),
                };
                const blob = new Blob([JSON.stringify(content, null, 4)], { type: "text/plain;charset=utf-8" });
                saveAs(blob, `${input.files[0].name.replace(/\.[^/.]+$/, "")}.bota64`);
              } else {
                d();
              }
            }
          }
        } catch (error: any) {
          ons.notification.alert(error.message);
        }
      });
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
                {this.methodF} <Icon icon={this.method === "encode" ? "md-lock" : "md-lock-open"} />
              </Button>
              <Button modifier="large" onClick={this.handleCopy} disabled={isFirefox} style={{ marginLeft: "4px" }}>
                Copy <Icon icon="md-copy" />
              </Button>
            </div>

            <label htmlFor={this.method + "_key"} className="button--large button--material button" style={{ marginTop: "8px" }}>
              <Ripple />
              File to {this.method} <Icon icon="md-file" />
            </label>
            <input
              // ...
              id={this.method + "_key"}
              key={this.method + "_key"}
              type="file"
              style={{ display: "none" }}
              accept={this.method === "decode" ? ".bota64" : ""}
              onChange={this.handleFileChange}
            />
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
