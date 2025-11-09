export interface TemplateNode {
  type: 'element' | 'text' | 'interpolation' | 'binding' | 'event' | 'control-flow';
  value?: string;
  tag?: string;
  attributes?: Record<string, string>;
  children?: TemplateNode[];
  expression?: string;
  bindingType?: 'property' | 'attribute' | 'class' | 'style';
  eventName?: string;
  condition?: string;
  loopVariable?: string;
  loopExpression?: string;
}

export function parseTemplate(template: string): TemplateNode[] {
  const nodes: TemplateNode[] = [];
  let i = 0;

  while (i < template.length) {
    // Skip whitespace
    if (/\s/.test(template[i])) {
      i++;
      continue;
    }

    // Parse interpolation {{ }}
    if (template[i] === '{' && template[i + 1] === '{') {
      const end = template.indexOf('}}', i);
      if (end !== -1) {
        const expression = template.substring(i + 2, end).trim();
        nodes.push({
          type: 'interpolation',
          expression,
        });
        i = end + 2;
        continue;
      }
    }

    // Parse control flow @if
    if (template[i] === '@' && template.substring(i, i + 3) === '@if') {
      const conditionStart = template.indexOf('(', i);
      const conditionEnd = template.indexOf(')', conditionStart);
      if (conditionEnd !== -1) {
        const condition = template.substring(conditionStart + 1, conditionEnd).trim();
        const blockStart = template.indexOf('{', conditionEnd);
        const blockEnd = findMatchingBrace(template, blockStart);
        if (blockEnd !== -1) {
          const blockContent = template.substring(blockStart + 1, blockEnd);
          nodes.push({
            type: 'control-flow',
            condition,
            children: parseTemplate(blockContent),
          });
          i = blockEnd + 1;
          continue;
        }
      }
    }

    // Parse control flow @for
    if (template[i] === '@' && template.substring(i, i + 4) === '@for') {
      const loopStart = template.indexOf('(', i);
      const loopEnd = template.indexOf(')', loopStart);
      if (loopEnd !== -1) {
        const loopExpr = template.substring(loopStart + 1, loopEnd).trim();
        const match = loopExpr.match(/(\w+)\s+of\s+(.+)/);
        if (match) {
          const [, variable, expression] = match;
          const blockStart = template.indexOf('{', loopEnd);
          const blockEnd = findMatchingBrace(template, blockStart);
          if (blockEnd !== -1) {
            const blockContent = template.substring(blockStart + 1, blockEnd);
            nodes.push({
              type: 'control-flow',
              loopVariable: variable.trim(),
              loopExpression: expression.trim(),
              children: parseTemplate(blockContent),
            });
            i = blockEnd + 1;
            continue;
          }
        }
      }
    }

    // Parse HTML element
    if (template[i] === '<') {
      const tagEnd = template.indexOf('>', i);
      if (tagEnd !== -1) {
        const tagContent = template.substring(i + 1, tagEnd);
        const isClosing = tagContent.startsWith('/');
        const isSelfClosing = tagContent.endsWith('/');

        if (!isClosing) {
          const tagMatch = tagContent.match(/^(\w+)/);
          if (tagMatch) {
            const tag = tagMatch[1];
            const attributes = parseAttributes(tagContent.substring(tag.length));

            // Check for property bindings [property]
            const propertyBindings: Record<string, string> = {};
            for (const [key, value] of Object.entries(attributes)) {
              if (key.startsWith('[') && key.endsWith(']')) {
                const propName = key.slice(1, -1);
                propertyBindings[propName] = value;
                delete attributes[key];
              }
            }

            // Check for event bindings (event)
            const eventBindings: Record<string, string> = {};
            for (const [key, value] of Object.entries(attributes)) {
              if (key.startsWith('(') && key.endsWith(')')) {
                const eventName = key.slice(1, -1);
                eventBindings[eventName] = value;
                delete attributes[key];
              }
            }

            const node: TemplateNode = {
              type: 'element',
              tag,
              attributes,
            };

            if (Object.keys(propertyBindings).length > 0) {
              node.bindingType = 'property';
              // Store bindings in attributes for now
              Object.assign(node.attributes || {}, propertyBindings);
            }

            if (Object.keys(eventBindings).length > 0) {
              node.type = 'event';
              node.eventName = Object.keys(eventBindings)[0];
              node.expression = Object.values(eventBindings)[0];
            }

            if (!isSelfClosing) {
              // Find closing tag
              const closingTag = `</${tag}>`;
              const closingIndex = template.indexOf(closingTag, tagEnd);
              if (closingIndex !== -1) {
                const content = template.substring(tagEnd + 1, closingIndex);
                node.children = parseTemplate(content);
                i = closingIndex + closingTag.length;
              } else {
                i = tagEnd + 1;
              }
            } else {
              i = tagEnd + 1;
            }

            nodes.push(node);
            continue;
          }
        } else {
          // Closing tag, skip
          i = tagEnd + 1;
          continue;
        }
      }
    }

    // Parse text node
    const textEnd = template.indexOf('<', i);
    if (textEnd !== -1) {
      const text = template.substring(i, textEnd).trim();
      if (text) {
        nodes.push({
          type: 'text',
          value: text,
        });
      }
      i = textEnd;
    } else {
      const text = template.substring(i).trim();
      if (text) {
        nodes.push({
          type: 'text',
          value: text,
        });
      }
      break;
    }
  }

  return nodes;
}

function parseAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+(?:\[.*?\]|\(.*?\))?)=["']([^"']*)["']/g;
  let match;

  while ((match = regex.exec(attrString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function findMatchingBrace(str: string, start: number): number {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

