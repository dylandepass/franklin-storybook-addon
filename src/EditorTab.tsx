import React from "react";
import { HelixEditor } from "./components/HelixEditor";

interface TabProps {
  active: boolean;
}

export const EditorTab: React.FC<TabProps> = ({ active }) => {
  return active ? <HelixEditor /> : null;
};