import RenderEngine from "./RenderEngine";

export default function Hydor<Component extends Object>(
  scopeSelector: string,
  component: Component,
) {
  const renderEngine = new RenderEngine(scopeSelector);

  Object.entries(component).forEach(([prop, value]) => {
    renderEngine.renderBindings(prop, value)
  })

  return new Proxy(component, {
    set(obj: Object, prop: string, value: any) {
      obj[prop] = value;
      renderEngine.renderBindings(prop, value);
      return true;
    },
  });
};