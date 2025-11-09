export class ReactiveNode {
  private consumers: Set<ReactiveNode> = new Set();
  private producers: Set<ReactiveNode> = new Set();
  private dirty = false;

  track(): void {
    // Track dependency if we're in a reactive context
    const currentContext = getCurrentContext();
    if (currentContext) {
      this.consumers.add(currentContext);
      currentContext.producers.add(this);
    }
  }

  markDirty(): void {
    if (!this.dirty) {
      this.dirty = true;
      // Notify all consumers
      for (const consumer of this.consumers) {
        if ('markDirty' in consumer) {
          (consumer as any).markDirty();
        }
      }
    }
  }

  isDirty(): boolean {
    return this.dirty;
  }

  clearDirty(): void {
    this.dirty = false;
  }
}

let currentContext: ReactiveNode | null = null;

export function getCurrentContext(): ReactiveNode | null {
  return currentContext;
}

export function setCurrentContext(context: ReactiveNode | null): void {
  currentContext = context;
}

export function markDirty(node: ReactiveNode): void {
  node.markDirty();
}

let updateScheduled = false;

export function scheduleUpdate(): void {
  if (!updateScheduled) {
    updateScheduled = true;
    Promise.resolve().then(() => {
      updateScheduled = false;
      // Update logic would go here
    });
  }
}

