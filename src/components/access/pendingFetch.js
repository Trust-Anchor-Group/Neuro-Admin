export async function pendingAction(userId, clickedState, options = {}) {
  try {
    const res = await fetch('/api/legalIdStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id: userId,
        state: clickedState,
        ...options,
      }),
    });

    let data = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error) {
    throw new Error(`Could not post fetch state ${error}`);
  }
}
