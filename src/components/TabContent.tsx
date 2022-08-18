import React from "react";
import { styled } from "@storybook/theming";

const PreviewWrapper = styled.div(({ theme }) => ({
  background: theme.background.content,
  height: "100%",
  width: "100%",
  overflow: "hidden",
}));

const IFrame = styled.iframe(({ theme }) => ({
  border: 0,
  height: "100%",
  width: "100%",
}));

interface TabContentProps {
  src: string;
}

export const TabContent: React.FC<TabContentProps> = ({ src }) => (
  <PreviewWrapper>
    <IFrame src={src}/>
  </PreviewWrapper>
);
