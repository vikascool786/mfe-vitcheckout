let queue: Promise<any> = Promise.resolve();

export function enqueueChangeOrder(task: () => Promise<any>) {
  queue = queue.then(task).catch((err) => {
    console.error("ChangeOrder queue error:", err);
  });
  return queue;
}

export function waitForAllChangeOrders() {
  return queue;
}