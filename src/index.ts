export default function Hydor<Component extends Object>(
  rootSelector: string,
  component: Component,
) {
  const $root = document.querySelector(rootSelector) as Element;

  return new Proxy(component, {
    set(obj: Object, prop: string, value: any) {

      DOM($root, prop, value).setAll();
      obj[prop] = value;
      
      return true;
    }
  });
};

function DOM($root: Element, prop: string, value: any) {

  const forEachElement = (selector: string, callback: (value: Element) => void) => {
    Array.from($root.querySelectorAll(selector)).forEach(callback);
    if ($root.matches(selector)) {
      callback($root);
    };
  };

  const interceptors = {
    'h-html': {
      set() {
        forEachElement(`[h-html="${prop}"]`, $el => {
          $el.innerHTML = value;
          $el.setAttribute('h-hydrated', '');
        });
      },
    },
    'h:': {
      set() {
        console.log({ $root, prop, value });
        const $elements = queryElementsWithBindings($root, prop);
        $elements.forEach($element => {
          Array.from($element.attributes)
            .filter(attr => attr.name.includes('h:'))
            .forEach(attr => {
              const attribute = attr.name.replace('h:', '');
              const modelKey = attr.nodeValue;

              if (prop !== modelKey) return;

              $element.setAttribute(attribute, value);
              $element.setAttribute('h-hydrated', '');
            });
        })
      },
    },
  };

  const setAll = () => Object.values(interceptors).forEach(interceptor => { interceptor.set() });

  return { setAll }
};

function queryElementsWithBindings(parent: Element, prop: string) {
  const items = getElementsByXPath(
    `//*[@*[starts-with(name(), "h:") and .="${prop}"]]`,
    parent
  );

  return items as Element[];
}

function getElementsByXPath(xpath, parent) {
  let results = [];
  let query = document.evaluate(
    xpath,
    parent || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    //@ts-ignore
    results.push(query.snapshotItem(i));
  }

  return results;
}