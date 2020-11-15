import { createContext, useContext } from "react";
import { SnowtailConfig } from "snowtail/config/models";

export const ConfigContext = createContext<SnowtailConfig | null>(null);

export const useConfig = () => useContext(ConfigContext) as SnowtailConfig;
