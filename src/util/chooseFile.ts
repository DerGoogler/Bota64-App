export default function (event: any, onLoadFileHandler: (event: any, file: any, input: any) => void): void {
  if (typeof window.FileReader !== "function") throw "The file API isn't supported on this browser.";
  let input = event.target;
  if (!input) throw "The browser does not properly implement the event object";
  if (!input.files) throw "This browser does not support the `files` property of the file input.";
  if (!input.files[0]) return undefined;
  let file = input.files[0];
  let fr = new FileReader();
  fr.onload = (ev) => {
    onLoadFileHandler(ev, file, input);
  };
  fr.readAsText(file);
}
