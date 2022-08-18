import type { DecoratorFunction } from "@storybook/addons";
import { useEffect, useGlobals } from "@storybook/addons";

export const withGlobals: DecoratorFunction = (StoryFn, context) => {
  const [{ myAddon }] = useGlobals();
  // Is the addon being used in the docs panel
  const isInDocs = context.viewMode === "docs";

  useEffect(() => {
    // Execute your side effect here
    // For example, to manipulate the contents of the preview
    const selectorId = isInDocs
      ? `#anchor--${context.id} .docs-story`
      : `#root`;

    displayToolState(selectorId, {
      myAddon,
      isInDocs,
    });
  }, [myAddon]);

  return StoryFn();
};

function displayToolState(selector: string, state: any) {
  const rootElement = document.querySelector(selector);
  let preElement = rootElement.querySelector("pre");

  if (!preElement) {
    preElement = document.createElement("pre");
    preElement.style.setProperty("margin-top", "2rem");
    preElement.style.setProperty("padding", "1rem");
    preElement.style.setProperty("background-color", "#f00");
    preElement.style.setProperty("border-radius", "3px");
    preElement.style.setProperty("max-width", "100%");
    rootElement.appendChild(preElement);
  }

  const button = document.createElement('button');
  button.textContent = "Click Me";
  let self = this;

  let boundFunction = (function() { // parenthesis are not necessary
      alert(this);             // but might improve readability
  }).bind(this); 

  button.addEventListener('click', boundFunction);
  
  preElement.appendChild(button);
}
