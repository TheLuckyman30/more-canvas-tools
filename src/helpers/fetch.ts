export async function fetcher<T>(endpoint: string) {
  const token = GM_getValue("CANVAS_TOKEN");
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return (await response.json()) as T;
}

export async function mutationFetcher<Input, Output>(opts: {
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Input;
}) {
  const token = GM_getValue("CANVAS_TOKEN");
  const { endpoint, method, body } = opts;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method,
    body: JSON.stringify(body ?? {}),
  });

  return (await response.json()) as Output;
}
