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
        created_at, 
        owner_id
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

export const loadSites = async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const result = await fetch(`${import.meta.env.VITE_BASE_URL}/sites`, {
    method: "GET",
    //  @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-Orbiter-Token": sessionData.session?.access_token,
    },
  });

  const data = await result.json();
  return data;
};

export const isOnboardingComplete = async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const { data: onboarding, error } = await supabase
    .from("users")
    .select("has_completed_onboarding")
    .eq("id", sessionData.session?.user.id);

  if (error) {
    throw error;
  }

  console.log({ onboarding });

  const onboardingComplete =
    onboarding && onboarding[0]
      ? onboarding[0].has_completed_onboarding
      : false;
  return onboardingComplete;
};

export const updateOnboardingResponses = async (dataToSubmit: any) => {
  // Insert data into Supabase
  console.log(dataToSubmit)
  const { error } = await supabase
    .from("onboarding_responses")
    .insert(dataToSubmit);

  if (error) throw error;

  const { error: userError } = await supabase.from("users")
  .update({ "has_completed_onboarding": true })
  .eq("id", dataToSubmit.user_id);

  if(userError) {
    throw userError;
  }
};
