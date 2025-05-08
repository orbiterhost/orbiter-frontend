import { getAccessToken } from "./auth";

export const getHeaders = async () => {
  const accessToken = await getAccessToken();
  return {
    "X-Orbiter-Token": accessToken,
  };
};

export const getSiteData = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/admin/sites`, {
      method: "GET",
      //  @ts-ignore
      headers: {
        ...headers,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/admin/users`, {
      method: "GET",
      //  @ts-ignore
      headers: {
        ...headers,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSubscriptionData = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/admin/subscriptions`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getMrrData = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/admin/mrr`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWalletBalance = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/admin/wallet_balance`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDailyVersions = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/admin/site_updates_by_day`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getDailyUsers = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/admin/users_by_day`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getOnboardingAnalytics = async ({ startDate, endDate}: { startDate?: string; endDate?: string}) => {
  try {
    let url = `${import.meta.env.VITE_BASE_URL}/admin/onboarding_data`;
    if(startDate && endDate) {
      url = url + `?startDate=${startDate}&endDate=${endDate}`
    }

    if(startDate && !endDate) {
      url = url + `?startDate=${startDate}`
    }

    if(endDate && !startDate) {
      url = url + `?endDate=${endDate}`
    }

    const headers = await getHeaders();
    const res = await fetch(
      url,
      {
        method: "GET",
        //  @ts-expect-error custom header
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getDeploymentSources = async ({ startDate, endDate}: { startDate?: string; endDate?: string}) => {
  try {
    let url = `${import.meta.env.VITE_BASE_URL}/admin/deployment_source`;
    if(startDate && endDate) {
      url = url + `?startDate=${startDate}&endDate=${endDate}`
    }

    if(startDate && !endDate) {
      url = url + `?startDate=${startDate}`
    }

    if(endDate && !startDate) {
      url = url + `?endDate=${endDate}`
    }

    const headers = await getHeaders();
    const res = await fetch(
      url,
      {
        method: "GET",
        //  @ts-expect-error custom header
        headers: {
          ...headers,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
