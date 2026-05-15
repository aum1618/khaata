const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Something went wrong" }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}

export const apiGet = (url: string) => fetchWithAuth(url);
export const apiPost = (url: string, body: any) =>
  fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) });
export const apiPut = (url: string, body: any) =>
  fetchWithAuth(url, { method: "PUT", body: JSON.stringify(body) });
export const apiDelete = (url: string) =>
  fetchWithAuth(url, { method: "DELETE" });
