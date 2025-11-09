import type { TemplateNode } from './template-parser';

interface GenerateOptions {
  filename: string;
  dev: boolean;
}

export function generateCode(ast: TemplateNode[], _options: GenerateOptions): string {
  const lines: string[] = [];

  lines.push("import { signal } from '@echo/reactivity';");
  lines.push('');
  lines.push('export function render(component: any, target: HTMLElement) {');
  lines.push('  const fragment = document.createDocumentFragment();');
  lines.push('  const nodes: (HTMLElement | Text)[] = [];');
  lines.push('');

  function generateNode(node: TemplateNode, indent: string = '    '): void {
    switch (node.type) {
      case 'text':
        if (node.value) {
          lines.push(`${indent}const textNode = document.createTextNode(${JSON.stringify(node.value)});`);
          lines.push(`${indent}fragment.appendChild(textNode);`);
          lines.push(`${indent}nodes.push(textNode);`);
        }
        break;

      case 'interpolation':
        if (node.expression) {
          lines.push(`${indent}const interpolatedValue = ${node.expression};`);
          lines.push(`${indent}const textNode = document.createTextNode(String(interpolatedValue));`);
          lines.push(`${indent}fragment.appendChild(textNode);`);
          lines.push(`${indent}nodes.push(textNode);`);
        }
        break;

      case 'element':
        if (node.tag) {
          lines.push(`${indent}const element = document.createElement(${JSON.stringify(node.tag)});`);
          
          // Add attributes
          if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
              if (!key.startsWith('[') && !key.startsWith('(')) {
                lines.push(`${indent}element.setAttribute(${JSON.stringify(key)}, ${JSON.stringify(value)});`);
              }
            }
          }

          // Handle property bindings
          if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
              if (key.startsWith('[') && key.endsWith(']')) {
                const propName = key.slice(1, -1);
                lines.push(`${indent}element.${propName} = ${value};`);
              }
            }
          }

          // Handle children
          if (node.children && node.children.length > 0) {
            for (const child of node.children) {
              generateNode(child, indent + '  ');
            }
          }

          lines.push(`${indent}element.appendChild(fragment);`);
          lines.push(`${indent}const elementFragment = document.createDocumentFragment();`);
          lines.push(`${indent}while (fragment.firstChild) {`);
          lines.push(`${indent}  elementFragment.appendChild(fragment.firstChild);`);
          lines.push(`${indent}}`);
          lines.push(`${indent}element.appendChild(elementFragment);`);
          lines.push(`${indent}fragment.appendChild(element);`);
          lines.push(`${indent}nodes.push(element);`);
        }
        break;

      case 'event':
        if (node.tag) {
          lines.push(`${indent}const element = document.createElement(${JSON.stringify(node.tag)});`);
          
          if (node.eventName && node.expression) {
            lines.push(`${indent}element.addEventListener(${JSON.stringify(node.eventName)}, (e) => {`);
            lines.push(`${indent}  ${node.expression}`);
            lines.push(`${indent}});`);
          }

          if (node.children && node.children.length > 0) {
            for (const child of node.children) {
              generateNode(child, indent + '  ');
            }
          }

          lines.push(`${indent}element.appendChild(fragment);`);
          lines.push(`${indent}const elementFragment = document.createDocumentFragment();`);
          lines.push(`${indent}while (fragment.firstChild) {`);
          lines.push(`${indent}  elementFragment.appendChild(fragment.firstChild);`);
          lines.push(`${indent}}`);
          lines.push(`${indent}element.appendChild(elementFragment);`);
          lines.push(`${indent}fragment.appendChild(element);`);
          lines.push(`${indent}nodes.push(element);`);
        }
        break;

      case 'control-flow':
        if (node.condition) {
          lines.push(`${indent}if (${node.condition}) {`);
          if (node.children) {
            for (const child of node.children) {
              generateNode(child, indent + '  ');
            }
          }
          lines.push(`${indent}}`);
        } else if (node.loopVariable && node.loopExpression) {
          lines.push(`${indent}const loopItems = ${node.loopExpression};`);
          lines.push(`${indent}for (const ${node.loopVariable} of loopItems) {`);
          if (node.children) {
            for (const child of node.children) {
              generateNode(child, indent + '  ');
            }
          }
          lines.push(`${indent}}`);
        }
        break;
    }
  }

  for (const node of ast) {
    generateNode(node);
  }

  lines.push('');
  lines.push('  target.appendChild(fragment);');
  lines.push('  return nodes;');
  lines.push('}');

  return lines.join('\n');
}

