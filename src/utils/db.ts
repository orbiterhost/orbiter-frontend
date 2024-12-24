import { supabase } from "./auth";

export const getOrgMemebershipsForUser = async () => {
  const { data: memberships, error } = await supabase
    .from("members")
    .select(
      `
      *,
      organizations (
        id,
        name,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching memberships:", error);
    return;
  }

  return memberships;
};

export const createOrganizationAndMembership = async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const fullName =
    sessionData?.session?.user.user_metadata.fullName ||
    sessionData?.session?.user?.email;
  const orgName = `${fullName}'s Organization`;

  await fetch(`${import.meta.env.VITE_BASE_URL}/organizations`, {
    method: "POST",
    //  @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-Orbiter-Token": sessionData.session?.access_token,
    },
    body: JSON.stringify({
      orgName,
    }),
  });
};

export const loadSites = async (orgId: number) => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const result = await fetch(`${import.meta.env.VITE_BASE_URL}/organizations/${orgId}/sites`, {
    method: "GET",
    //  @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-Orbiter-Token": sessionData.session?.access_token,
    }
  });

  const data = await result.json();
  return data;
};
