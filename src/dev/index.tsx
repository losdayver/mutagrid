import "./assets/styles.css";
import { createRoot } from "react-dom/client";
import { PreviewApp } from "./previewApp";

const previewAppRoot =
  document.querySelector<HTMLDialogElement>("#preview-app-root")!;

const appRoot = createRoot(previewAppRoot);

appRoot.render(<PreviewApp></PreviewApp>);
