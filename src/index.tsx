import * as React from "react";
import { SnowtailConfig } from "snowtail/config/models";
import { ReactDOMConfig } from "snowtail/config/react-dom";

const main = (config: SnowtailConfig) => {
  config.renderer(config.root, config);
};

main(ReactDOMConfig);
