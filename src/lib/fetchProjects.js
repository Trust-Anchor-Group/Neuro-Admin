export async function fetchProjects(localizationTag) {
  try {
    const query = localizationTag
      ? `?localization=${encodeURIComponent(localizationTag)}`
      : "";

    const response = await fetch(`/api/projects${query}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error fetching projects: ${response.status} - ${response.statusText}`);
    }

    const payload = await response.json();
    const data = payload?.data;
    const listProjects = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : Array.isArray(payload)
          ? payload
          : [];

    const details = await Promise.all(
      listProjects.map(async (project) => {
        const projectId = project?.project_id;
        if (!projectId) return project;

        try {
          const detailRes = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            credentials: "include",
          });

          if (!detailRes.ok) return project;

          const detailPayload = await detailRes.json();
          const detailData = detailPayload?.data;
          const normalizedDetail = detailData?.data ?? detailData;

          if (normalizedDetail && typeof normalizedDetail === "object") {
            return {
              ...project,
              ...normalizedDetail,
            };
          }

          return project;
        } catch {
          return project;
        }
      }),
    );

    return { orders: details, loading: false };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { orders: [], loading: false, error: true };
  }
}