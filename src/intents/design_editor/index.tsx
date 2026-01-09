import "@canva/app-ui-kit/styles.css";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";

async function render() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Element with id 'root' not found");
  }

  const root = createRoot(rootElement);

  root.render(
    <AppI18nProvider>
      <AppUiProvider>
        <App />
      </AppUiProvider>
    </AppI18nProvider>,
  );
}

export default { render };

if (module.hot) {
  module.hot.accept("./app", render);
}
