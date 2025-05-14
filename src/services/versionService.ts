interface VersionInfo {
  _id: string;
  version: string;
  type: "major" | "minor" | "patch";
  releaseNotes?: string;
  createdAt: string;
  downloadUrl: string;
}

export const fetchVersionInfo = async (
  major?: string
): Promise<VersionInfo | null> => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  try {
    const url = `${backendUrl}/api/version/latest${
      major ? `?major=${major}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching version info:", error);
    return null;
  }
};
