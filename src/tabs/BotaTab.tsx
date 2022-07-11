import { Component, ReactNode } from "react";
import { Button, Card, Dialog, Icon, List, ListHeader, ListItem, Page, Ripple, Switch } from "react-onsenui";
import Bota64, { Bota64Class, IBota64 } from "bota64";
import ons from "onsenui";
import { dom } from "googlers-tools";
import { isFirefox } from "react-device-detect";
import saveAs from "file-saver";
import chooseFile from "../util/chooseFile";
import pkg from "./../../package.json";
import UTF8 from "../util/UTF8";

namespace BotaTab {
  export interface States {
    input: string;
    output: string;
    clipboardState: string;
    dialogShown: boolean;
  }

  export interface Props {
    method: "encode" | "decode";
  }

  interface FILE_META {
    meta: {
      date: string;
      usedMethod: string;
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
    content: any;
  }

  export class Create extends Component<Props, States> {
    private bota: IBota64;
    private method: "encode" | "decode";
    private isEncode: boolean;
    private isDecode: boolean;

    public constructor(props: Props | Readonly<Props>) {
      super(props);

      this.method = props.method;

      this.state = {
        input: "",
        output: "Empty",
        clipboardState: "",
        dialogShown: false,
      };

      this.bota = new Bota64Class();

      this.isEncode = this.method === "encode";
      this.isDecode = this.method === "decode";

      this.showDialog = this.showDialog.bind(this);
      this.hideDialog = this.hideDialog.bind(this);
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
        dom.permission("clipboard-write").then((status: PermissionStatus) => {
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

          if (this.isDecode) {
            const ctnt: FILE_META = JSON.parse(event.target.result);
            const svfFile = (blob: BlobPart[]) => {
              const blob_ = new Blob(blob, { type: "text/plain;charset=utf-8" });
              saveAs(blob_, ctnt.file.originalName);
            };
            switch (ctnt.meta.usedMethod) {
              case "Bota64":
                svfFile([this.bota.decode(ctnt.content)]);
                break;
              case "Bota64/Unit8Array":
                svfFile([this.bota.decode(UTF8.decode(Object.values(ctnt.content)))]);
                break;

              default:
                ons.notification.alert("File isn't an Bota64 file");
                break;
            }
          } else {
            const _P: FILE_META = this.isJsonString(event.target.result)
              ? JSON.parse(event.target.result)
              : {
                  meta: {
                    usedMethod: null,
                  },
                  content: event.target.result,
                };
            const d = () => ons.notification.alert("Re-encoding isn't allowed!");
            if (_P.meta.usedMethod === "Bota64") {
              d();
            } else {
              if (this.getFileExtension(input.files[0].name) != "bota64") {
                let content: FILE_META = {
                  meta: {
                    date: new Date().toString(),
                    usedMethod: "Bota64",
                    version: {
                      app: pkg.version,
                      lib: this.bota.version(),
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

                console.log(content.content);
                if (this.state.input === "Bota64/Unit8Array") {
                  content.meta.usedMethod = "Bota64/Unit8Array";
                  content.content = JSON.parse(JSON.stringify(UTF8.encode(this.bota.encode(event.target.result))));
                  console.log(content.content);
                }
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

    private showDialog() {
      this.setState({ dialogShown: true });
    }

    private hideDialog() {
      this.setState({ dialogShown: false });
    }

    public render(): ReactNode {
      const { input, output } = this.state;

      return (
        <>
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
                  {this.methodF} <Icon icon={this.isEncode ? "md-lock" : "md-lock-open"} />
                </Button>
                <Button modifier="large" onClick={this.handleCopy} disabled={isFirefox} style={{ marginLeft: "4px" }}>
                  Copy <Icon icon="md-copy" />
                </Button>
              </div>
              <div style={{ display: "flex", width: "100%", marginTop: "8px" }}>
                <label htmlFor={this.method + "_key"} className="button--large button--material button">
                  <Ripple />
                  File to {this.method} <Icon icon="md-file" />
                </label>
              </div>
            </section>
            <Card>
              <div className="title right">Output</div>
              <div className="content">
                <span>{output}</span>
              </div>
            </Card>
            <input
              // ...
              id={this.method + "_key"}
              key={this.method + "_key"}
              type="file"
              style={{ display: "none", marginRight: "4px" }}
              accept={this.method === "decode" ? ".bota64" : ""}
              onChange={this.handleFileChange}
            />
          </Page>
        </>
      );
    }
  }
}

export default BotaTab;
