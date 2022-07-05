import getElementsByXPath from "./utils/getElementsByXPath";

export default class RenderEngine {
  $scope: HTMLElement
  scopeSelector: string

  constructor(scopeSelector: string) {
    this.scopeSelector = scopeSelector;
    this.$scope = document.querySelector(this.scopeSelector) as HTMLElement;;
  }

  /** Render all data bindings to their respective targets */
  public renderBindings(prop: string, value: any) {
    // console.log('render', {prop, value})
    const mutations = {
      'h-text': ($element: HTMLElement) => {
        $element.innerText = value;
        this.setHydrated($element);
      },
      'h-bind:': ($element: HTMLElement, directive: Attr) => {
        const attribute = directive.name.replace('h-bind:', '');
        $element.setAttribute(attribute, value);
        this.setHydrated($element);
      },
      'h-if': ($element: HTMLElement, directive: Attr) => {
        const attribute = directive.name.replace('h-bind:', '');
        $element.setAttribute(attribute, value);
        this.setHydrated($element);
      },
    };

    // Calls DOM mutations for each element and directive matched
    Object.entries(mutations).forEach(([directive, mutation]) => {
      this.forEachDirective(directive, prop, mutation)
    })
  }

  private setHydrated($element: HTMLElement) {
    const directive = 'h-hydrated';
    if ($element.hasAttribute(directive)) return;
    $element.setAttribute(directive, '');
  }

  /** Iterates over each matched by binding attribute */
  private forEachDirective(directive: string, prop: string, callback: ($el: HTMLElement, attr: Attr) => void) {
    // Queries elements which attribute name starts with "selector" and value is "prop"
    const xpath = `//*[@*[starts-with(name(), "${directive}") and .="${prop}"]]`;
    const $elements = getElementsByXPath(xpath, this.$scope) as HTMLElement[];

    if ($elements.length) {
      console.log($elements);
    }

    $elements.forEach($element => {
      Array.from($element.attributes)
        .filter(attr => attr.name.includes(directive) && prop === attr.nodeValue)
        .forEach(directive => {
          console.log(
            `UPDATED ${this.scopeSelector}:`,
            `${directive.nodeName}=${prop}`
          );
          callback($element, directive);
        });
    });    
  }
}