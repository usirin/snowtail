import React from "react";
import * as ReactDOM from "react-dom";
import { App } from "snowtail/components/App";
import { Renderer, SnowtailConfig } from "snowtail/config/models";
import { ConfigContext } from "snowtail/config/react-context";

const ReactDOMRenderer: Renderer = (element, config) => {
  ReactDOM.render(
    <ConfigContext.Provider value={ReactDOMConfig}>
      <App />
    </ConfigContext.Provider>,
    element,
  );
};

export const ReactDOMConfig: SnowtailConfig = {
  renderer: ReactDOMRenderer,
  root: document.getElementById("root")!,
};
